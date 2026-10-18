// =============================================================================
// HyperFrames bake-off: render scene S5 of the RDA explainer twice, once from the HyperFrames port
// (s5-tool.html) and once from the Remotion original (RdaExplainer frames 1080-1439), then compare
// them frame by frame (SSIM) and by loudness. Also renders stamp-overlay.html as an alpha .mov and
// reports its codec, the format tools/bake.py composites for 'overlay' shots.
//
//   node experiments/hyperframes/bakeoff.mjs          (from the repo root)
//
// Needs node 22+, ffmpeg/ffprobe on PATH, `npm ci` already run in remotion/, and network for npx and
// `npm pack gsap`. Everything it writes goes to remotion/out/hyperframes-bakeoff/ (git-ignored).
// HyperFrames telemetry is switched off for every call (HYPERFRAMES_NO_TELEMETRY=1).
// Browser: set HYPERFRAMES_BROWSER_PATH / REMOTION_BROWSER_EXECUTABLE to use a specific Chrome.
// Otherwise it uses a Playwright headless shell under /opt/pw-browsers if present, else each
// tool's own download.
// =============================================================================
import { execFileSync, spawnSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const HF = 'hyperframes@0.8.171'; // pinned so a rerun measures the same renderer
const GSAP = 'gsap@3.14.2';
const S5_START = 1080; // S1 180 + S2 360 + S3 180 + S4 360 frames
const S5_DUR = 360;
const LOOK_AT = [25, 170, 300]; // local frames saved side by side for reading by eye

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..', '..');
const remotionRoot = path.join(repo, 'remotion');
const work = path.join(remotionRoot, 'out', 'hyperframes-bakeoff');
const win = process.platform === 'win32';

function findBrowser() {
  const base = '/opt/pw-browsers';
  if (!existsSync(base)) return undefined;
  const shell = readdirSync(base).filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop();
  const p = shell && path.join(base, shell, 'chrome-linux', 'headless_shell');
  return p && existsSync(p) ? p : undefined;
}
const browser = findBrowser();
const hfEnv = { ...process.env, HYPERFRAMES_NO_TELEMETRY: '1', HYPERFRAMES_SKIP_SKILLS: '1' };
if (!hfEnv.HYPERFRAMES_BROWSER_PATH && browser) hfEnv.HYPERFRAMES_BROWSER_PATH = browser;
const remotionBrowser = process.env.REMOTION_BROWSER_EXECUTABLE || browser;

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { stdio: 'inherit', shell: win && cmd === 'npx', ...opts });
const secondsSince = (t) => Math.round((Date.now() - t) / 100) / 10;

// ── 1. HyperFrames project folders: the HTML plus local fonts, SFX and GSAP ──
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
run('npm', ['pack', GSAP, '--silent', '--pack-destination', work], { shell: win });
const tgz = readdirSync(work).find((f) => f.startsWith('gsap-') && f.endsWith('.tgz'));
run('tar', ['xzf', path.join(work, tgz), '-C', work]);

function project(name, html, audio) {
  const dir = path.join(work, name);
  for (const sub of ['fonts', 'js', 'audio']) mkdirSync(path.join(dir, 'assets', sub), { recursive: true });
  copyFileSync(path.join(here, html), path.join(dir, 'index.html'));
  const fonts = path.join(repo, 'media', 'library', 'fonts', 'rda');
  for (const f of readdirSync(fonts).filter((f) => f.endsWith('.woff2'))) copyFileSync(path.join(fonts, f), path.join(dir, 'assets', 'fonts', f));
  for (const f of ['gsap.min.js', 'CustomEase.min.js']) copyFileSync(path.join(work, 'package', 'dist', f), path.join(dir, 'assets', 'js', f));
  for (const [kind, id] of audio) copyFileSync(path.join(repo, 'media', 'library', kind, 'clips', `${id}.mp3`), path.join(dir, 'assets', 'audio', `${id}.mp3`));
  return dir;
}
const s5 = project('s5', 's5-tool.html', [
  ['music', 'docu-pluck'],
  ['sfx', 'ui-click-soft'],
  ['sfx', 'whoosh-soft'],
  ['sfx', 'stamp-hit'],
  ['sfx', 'chime-reward'],
]);
const stamp = project('stamp', 'stamp-overlay.html', []);

// ── 2. Render with HyperFrames ───────────────────────────────────────────────
if (!hfEnv.HYPERFRAMES_BROWSER_PATH) run('npx', ['-y', HF, 'browser', 'ensure'], { env: hfEnv });
run('npx', ['-y', HF, 'check'], { cwd: s5, env: hfEnv });
const hfOut = path.join(work, 'hyperframes-s5.mp4');
let t = Date.now();
run('npx', ['-y', HF, 'render', '--fps', '30', '--crf', '18', '--workers', '4', '--quiet', '-o', hfOut], { cwd: s5, env: hfEnv });
const hfSeconds = secondsSince(t);
const movOut = path.join(work, 'hyperframes-stamp.mov');
run('npx', ['-y', HF, 'render', '--format', 'mov', '--fps', '30', '--quiet', '-o', movOut], { cwd: stamp, env: hfEnv });

// ── 3. Render the same frames with Remotion (as scripts/render-one.mjs does) ─
const require = createRequire(path.join(remotionRoot, 'package.json'));
const { bundle } = await import(require.resolve('@remotion/bundler'));
const { selectComposition, renderMedia } = await import(require.resolve('@remotion/renderer'));
const gen = (extra) => run('node', [path.join(remotionRoot, 'scripts', 'gen-registry.mjs'), ...extra], { cwd: remotionRoot });
const remOut = path.join(work, 'remotion-s5.mp4');
let bundleSeconds;
let remSeconds;
try {
  gen(['--group=rda-explainer']);
  t = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(remotionRoot, 'src', 'index.ts'), publicDir: path.join(repo, 'media') });
  bundleSeconds = secondsSince(t);
  t = Date.now();
  const opts = { browserExecutable: remotionBrowser, timeoutInMilliseconds: 120000 };
  const composition = await selectComposition({ serveUrl, id: 'RdaExplainer', ...opts });
  await renderMedia({
    serveUrl, composition, codec: 'h264', crf: 18, outputLocation: remOut, overwrite: true, concurrency: 4,
    frameRange: [S5_START, S5_START + S5_DUR - 1], ...opts,
  });
  remSeconds = secondsSince(t);
} finally {
  gen([]); // always restore the full registry so Studio keeps working
}

// ── 4. Compare ───────────────────────────────────────────────────────────────
const ffmpeg = (args) => spawnSync('ffmpeg', ['-hide_banner', ...args], { encoding: 'utf8', cwd: work });
const probe = (file, entries) =>
  execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', `stream=${entries}`, '-of', 'default=nw=1', file], { encoding: 'utf8' }).trim();
const frames = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim().replace(/,$/, ''));

// A bare file name: ffmpeg's filter parser would split a full Windows path at its ':'. ffmpeg runs in `work`.
const ssimRun = ffmpeg(['-i', hfOut, '-i', remOut, '-lavfi', '[0:v][1:v]ssim=stats_file=ssim.txt', '-f', 'null', '-']);
if (ssimRun.status !== 0) throw new Error(`ssim failed:\n${ssimRun.stderr}`);
const ssim = readFileSync(path.join(work, 'ssim.txt'), 'utf8').trim().split('\n').map((l) => Number(/All:([\d.]+)/.exec(l)[1]));
const mean = ssim.reduce((a, b) => a + b, 0) / ssim.length;
const min = Math.min(...ssim);

const loudness = (file) => {
  const r = ffmpeg(['-i', file, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-']);
  const last = (re) => [...r.stderr.matchAll(re)].pop()?.[1];
  return { lufs: Number(last(/^\s+I:\s+(-?[\d.]+) LUFS/gm)), peakDb: Number(last(/^\s+Peak:\s+(-?[\d.]+) dBFS/gm)) };
};

for (const n of LOOK_AT) {
  const png = path.join(work, `side-by-side-f${n}.png`);
  ffmpeg(['-y', '-i', hfOut, '-i', remOut, '-filter_complex', `[0:v]select=eq(n\\,${n})[a];[1:v]select=eq(n\\,${n})[b];[a][b]hstack`, '-frames:v', '1', png]);
}

const summary = {
  measured: new Date().toISOString(),
  hyperframes: { version: HF, renderSeconds: hfSeconds, frames: frames(hfOut), ...loudness(hfOut) },
  remotion: { bundleSeconds, renderSeconds: remSeconds, frames: frames(remOut), ...loudness(remOut) },
  ssim: { mean: Number(mean.toFixed(4)), min: Number(min.toFixed(4)), minAtFrame: ssim.indexOf(min) },
  alphaOverlay: probe(movOut, 'codec_name,profile,pix_fmt').split('\n').join(' '),
};
writeFileSync(path.join(work, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log('\n' + JSON.stringify(summary, null, 2));
console.log(`\nside-by-side frames (HyperFrames left, Remotion right) in ${path.relative(process.cwd(), work)}`);
