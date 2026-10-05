/**
 * Build a side-by-side verdict page from a set of candidate video clips.
 *
 * The video twin of the voice-lab audition page: every candidate plays in the same frame size,
 * loops, and carries a PASS / MAYBE / NO button. Verdicts are kept in localStorage and can be
 * copied out as one line per clip, which is how Hasan's terse verdicts get back into the repo.
 *
 * Usage:
 *   node tools/make_verdict_page.mjs --manifest lab.json --out page.html [--height 640] [--crf 30]
 *
 * The manifest is a JSON array, one entry per candidate:
 *   [{ "id": "omnihuman", "label": "OmniHuman v1.5", "file": "path/to/clip.mp4",
 *      "meta": "$0.16/s · 1080p · fal" }]
 *
 * Clips are re-encoded small (default 640px tall, crf 30, muted-safe AAC) and inlined as
 * base64 data URIs, because a published artifact cannot fetch anything from an external host.
 * That inlining is the whole reason for the compression: budget ~16MB for the finished page,
 * so keep candidates under ~600KB each and you can fit ~20. The tool prints the running total
 * and refuses to write a page that would exceed the limit.
 *
 * ffmpeg must be on PATH, or pass --ffmpeg <path> (this machine keeps a portable build).
 */

import { readFile, writeFile, mkdtemp, rm, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const LIMIT_BYTES = 15 * 1024 * 1024; // leave headroom under the artifact's 16MB ceiling

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const k = argv[i].slice(2);
    const n = argv[i + 1];
    if (n === undefined || n.startsWith("--")) out[k] = true;
    else { out[k] = n; i++; }
  }
  return out;
}

function die(m) { console.error(m); process.exit(1); }

function run(bin, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("error", reject);
    p.on("close", (c) => (c === 0 ? resolve() : reject(new Error(err.slice(-1200)))));
  });
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.manifest || !args.out) die("--manifest and --out are required");
  const ffmpeg = args.ffmpeg || process.env.FFMPEG || "ffmpeg";
  const height = Number(args.height || 640);
  const crf = Number(args.crf || 30);
  const title = args.title || "Avatar verdict lab";

  const items = JSON.parse(await readFile(args.manifest, "utf8"));
  if (!Array.isArray(items) || !items.length) die("manifest must be a non-empty JSON array");

  const work = await mkdtemp(path.join(tmpdir(), "verdict-"));
  const cards = [];
  let total = 0;

  for (const it of items) {
    const src = path.resolve(it.file);
    await stat(src).catch(() => die(`no such clip: ${src}`));

    // Still-image candidates ("type": "image"): scaled JPEG, kept tall enough to read
    // in-image text (diagrams). Cheap in bytes next to the video cards.
    if (it.type === "image") {
      const smallImg = path.join(work, `${it.id}.jpg`);
      await run(ffmpeg, ["-y", "-i", src, "-vf", `scale=-2:${Number(args["image-height"] || 960)}`, "-q:v", "3", smallImg])
        .catch((e) => die(`ffmpeg failed on ${it.id}: ${e.message}`));
      const ib = await readFile(smallImg);
      total += ib.length;
      console.log(`  ${it.id.padEnd(18)} ${(ib.length / 1024).toFixed(0).padStart(5)} KB   (running ${(total / 1e6).toFixed(1)} MB)`);
      cards.push({ ...it, uri: `data:image/jpeg;base64,${ib.toString("base64")}`, isImage: true });
      continue;
    }

    const small = path.join(work, `${it.id}.mp4`);
    // -vf scale: even dimensions only, or libx264 refuses. faststart so it plays while decoding.
    await run(ffmpeg, [
      "-y", "-i", src,
      "-vf", `scale=-2:${height}`,
      "-c:v", "libx264", "-crf", String(crf), "-preset", "slow", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart",
      small,
    ]).catch((e) => die(`ffmpeg failed on ${it.id}: ${e.message}`));

    const bytes = await readFile(small);
    total += bytes.length;
    console.log(`  ${it.id.padEnd(18)} ${(bytes.length / 1024).toFixed(0).padStart(5)} KB   (running ${(total / 1e6).toFixed(1)} MB)`);
    cards.push({ ...it, uri: `data:video/mp4;base64,${bytes.toString("base64")}` });
  }

  if (total > LIMIT_BYTES) {
    die(`inlined clips total ${(total / 1e6).toFixed(1)} MB, over the ~15MB budget — ` +
        `re-run with a smaller --height (try ${Math.max(360, height - 160)}) or a higher --crf`);
  }

  const html = `<title>${esc(title)}</title>
<style>
  :root{--bg:#faf9f7;--fg:#1a1a1a;--muted:#6b6b6b;--line:#e3e0da;--card:#fff;
        --pass:#1f7a4d;--maybe:#a8760b;--no:#b3261e;--accent:#c2410c}
  :root:not([data-theme="light"]){}
  @media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
    --bg:#141413;--fg:#f0eee9;--muted:#9a968e;--line:#2e2c29;--card:#1d1c1a;
    --pass:#4ade80;--maybe:#fbbf24;--no:#f87171;--accent:#fb923c}}
  :root[data-theme="dark"]{--bg:#141413;--fg:#f0eee9;--muted:#9a968e;--line:#2e2c29;--card:#1d1c1a;
    --pass:#4ade80;--maybe:#fbbf24;--no:#f87171;--accent:#fb923c}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);
       font:16px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;padding:32px 20px 80px}
  header{max-width:1100px;margin:0 auto 28px}
  h1{font-size:1.9rem;margin:0 0 6px;letter-spacing:-.02em}
  .sub{color:var(--muted);margin:0}
  .grid{max-width:1100px;margin:0 auto;display:grid;gap:20px;
        grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;
        display:flex;flex-direction:column}
  video{width:100%;display:block;background:#000;aspect-ratio:9/16;object-fit:contain}
  img.cand{width:100%;display:block;background:#000;aspect-ratio:9/16;object-fit:contain}
  .body{padding:12px 14px 14px}
  .label{font-weight:650;letter-spacing:-.01em}
  .meta{color:var(--muted);font-size:.82rem;margin-top:2px}
  .btns{display:flex;gap:6px;margin-top:11px}
  button{flex:1;padding:7px 0;border-radius:8px;border:1px solid var(--line);background:transparent;
         color:var(--muted);font:inherit;font-size:.82rem;font-weight:600;cursor:pointer}
  button:hover{border-color:var(--fg);color:var(--fg)}
  button[aria-pressed="true"][data-v="pass"]{background:var(--pass);border-color:var(--pass);color:#fff}
  button[aria-pressed="true"][data-v="maybe"]{background:var(--maybe);border-color:var(--maybe);color:#fff}
  button[aria-pressed="true"][data-v="no"]{background:var(--no);border-color:var(--no);color:#fff}
  .bar{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--line);
       padding:11px 20px;display:flex;gap:14px;align-items:center;justify-content:center}
  .bar button{flex:0 0 auto;padding:7px 16px;border-color:var(--accent);color:var(--accent)}
  #out{max-width:1100px;margin:22px auto 0;white-space:pre-wrap;font-family:ui-monospace,monospace;
       font-size:.82rem;color:var(--muted)}
</style>
<header>
  <h1>${esc(title)}</h1>
  <p class="sub">Same script, same reference, same voice. One question: is that me?</p>
</header>
<div class="grid">
${cards.map((c) => `  <div class="card">
    ${c.isImage ? `<img class="cand" src="${c.uri}" alt="${esc(c.label)}">` : `<video src="${c.uri}" controls loop playsinline preload="metadata"></video>`}
    <div class="body">
      <div class="label">${esc(c.label)}</div>
      <div class="meta">${esc(c.meta || "")}</div>
      <div class="btns" data-id="${esc(c.id)}">
        <button data-v="pass" aria-pressed="false">PASS</button>
        <button data-v="maybe" aria-pressed="false">MAYBE</button>
        <button data-v="no" aria-pressed="false">NO</button>
      </div>
    </div>
  </div>`).join("\n")}
</div>
<div id="out"></div>
<div class="bar">
  <button id="copy">Copy verdicts</button>
  <button id="reset">Reset</button>
</div>
<script>
  var KEY = "verdicts:${esc(title)}";
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { state = {}; }

  function paint() {
    document.querySelectorAll(".btns").forEach(function (g) {
      var v = state[g.dataset.id];
      g.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.v === v));
      });
    });
    var lines = Object.keys(state).map(function (k) { return k + ": " + state[k].toUpperCase(); });
    document.getElementById("out").textContent = lines.join("\\n");
  }

  document.querySelectorAll(".btns button").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.parentElement.dataset.id;
      state[id] = state[id] === b.dataset.v ? undefined : b.dataset.v;
      if (!state[id]) delete state[id];
      localStorage.setItem(KEY, JSON.stringify(state));
      paint();
    });
  });
  document.getElementById("copy").addEventListener("click", function () {
    navigator.clipboard.writeText(document.getElementById("out").textContent || "");
  });
  document.getElementById("reset").addEventListener("click", function () {
    state = {}; localStorage.removeItem(KEY); paint();
  });
  // One at a time — comparing two soundtracks at once tells you nothing.
  document.querySelectorAll("video").forEach(function (v) {
    v.addEventListener("play", function () {
      document.querySelectorAll("video").forEach(function (o) { if (o !== v) o.pause(); });
    });
  });
  paint();
</script>
`;

  await writeFile(args.out, html, "utf8");
  await rm(work, { recursive: true, force: true });
  console.log(`wrote ${args.out}  (${((await stat(args.out)).size / 1e6).toFixed(1)} MB, ${cards.length} candidates)`);
}

main();
