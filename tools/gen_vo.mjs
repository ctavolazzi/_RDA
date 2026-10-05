/**
 * Generate per-beat VO mp3s with ElevenLabs — the Shorts-factory voice step.
 *
 * The voice recipe is LOCKED (voice-lab 2026-08-12, recipe #18): Hasan-Pro on
 * eleven_multilingual_v2 with SSML breaks, style 0.3, speed 0.95, stability 0.55,
 * similarity 0.8. Never v3 (no PVC fine-tune -> raw-sample reconstruction -> identity drift).
 *
 * Usage:
 *   node tools/gen_vo.mjs --beats videos/short-blocks-30/work/vo-beats.json \
 *     --out-dir media/projects/short-blocks-30/vo
 *
 * The beats file maps id -> TTS text (SSML <break/> tags allowed; spell numbers the way
 * they should be SPOKEN — "p fifty", not "p50"):
 *   { "b1": "someone just told you your app is slow.", ... }
 *
 * Per-beat, consecutive requests are stitched with previous_request_ids so prosody stays
 * consistent across the Short (voice-lab sample 21 technique).
 *
 * Writes <out-dir>/<id>.mp3 plus a sibling vo-manifest.json with durations (via ffprobe
 * if on PATH) and the exact settings used, so any mp3 traces back to its recipe.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import process from "node:process";

const VOICE_ID = "BTq6sz7H4zXMYN9OUp1X"; // Hasan-Pro (PVC)
const MODEL_ID = "eleven_multilingual_v2"; // NEVER v3 — see header
const SETTINGS = { stability: 0.55, similarity_boost: 0.8, style: 0.3, speed: 0.95 };

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[a.slice(2)] = true;
    else { out[a.slice(2)] = next; i++; }
  }
  return out;
}

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");

function die(msg) { console.error(msg); process.exit(1); }

async function loadEnvKey(name) {
  let text;
  try { text = await readFile(path.join(repoRoot, ".env"), "utf8"); }
  catch { die(`no .env at ${path.join(repoRoot, ".env")}`); }
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (t.startsWith(name + "=")) {
      const v = t.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
      if (v) return v;
    }
  }
  return die(`${name} not found in .env`);
}

function probeDuration(file) {
  return new Promise((resolve) => {
    execFile("ffprobe", ["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", file],
      (err, stdout) => resolve(err ? null : parseFloat(stdout.trim()) || null));
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.beats || !args["out-dir"]) die("usage: node tools/gen_vo.mjs --beats <beats.json> --out-dir <dir>");

  const beats = JSON.parse(await readFile(path.resolve(args.beats), "utf8"));
  const outDir = path.resolve(args["out-dir"]);
  await mkdir(outDir, { recursive: true });
  const key = await loadEnvKey("ELEVENLABS_API_KEY");

  const manifest = { voice_id: VOICE_ID, model_id: MODEL_ID, settings: SETTINGS, recipe: "#18", beats: {} };
  const prevIds = [];

  for (const [id, text] of Object.entries(beats)) {
    console.log(`${id}: "${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`);
    const body = {
      text,
      model_id: MODEL_ID,
      voice_settings: SETTINGS,
    };
    // stitch prosody across the Short (API accepts up to the 3 most recent ids)
    if (prevIds.length) body.previous_request_ids = prevIds.slice(-3);

    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_192`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) die(`${id}: HTTP ${r.status}: ${(await r.text()).slice(0, 800)}`);
    const reqId = r.headers.get("request-id");
    if (reqId) prevIds.push(reqId);

    const outFile = path.join(outDir, `${id}.mp3`);
    await writeFile(outFile, Buffer.from(await r.arrayBuffer()));
    const dur = await probeDuration(outFile);
    manifest.beats[id] = { text, file: `${id}.mp3`, duration_s: dur, request_id: reqId };
    console.log(`  wrote ${path.relative(repoRoot, outFile)}${dur ? `  (${dur.toFixed(2)}s)` : ""}`);
  }

  const manifestFile = path.join(outDir, "vo-manifest.json");
  await writeFile(manifestFile, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`wrote ${path.relative(repoRoot, manifestFile)}`);
}

main();
