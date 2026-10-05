// Render ONE composition from ONE shot folder, bundling only that folder.
//
//   node scripts/render-one.mjs <group> <CompositionId>                    -> out/<Id>.mp4
//   node scripts/render-one.mjs <group> <CompositionId> --still 90,170,380 -> out/stills/<Id>-f<N>.png
//   options: --scale=0.5 (stills default 0.5, video 1)  --concurrency=4  --out=<path>
//
// Example: node scripts/render-one.mjs rda-explainer RdaExplainer
//
// Why this exists (_RDA, 2026-10-05): render-all.mjs bundles EVERY shot, and the example shots
// load Google Fonts over the network. Where that is blocked (a sandbox, a proxy, offline), the whole
// bundle fails, even for a shot that bundles its own fonts. This script regenerates the registry for
// one group, renders, and then ALWAYS restores the full registry so Studio keeps working.
//
// Browser: set REMOTION_BROWSER_EXECUTABLE to use a specific Chrome/Chromium. Otherwise it uses a
// Playwright headless shell under /opt/pw-browsers if present, else Remotion's own download.
import { execFileSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { bundle } from '@remotion/bundler';
import { selectComposition, renderMedia, renderStill } from '@remotion/renderer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name) => {
  const a = args.find((x) => x === `--${name}` || x.startsWith(`--${name}=`));
  if (!a) return undefined;
  if (a.includes('=')) return a.split('=').slice(1).join('=');
  const i = args.indexOf(a);
  return args[i + 1];
};
const positional = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1] === '--still'));
const [group, id] = positional;
if (!group || !id) {
  console.error('usage: node scripts/render-one.mjs <group> <CompositionId> [--still 10,20] [--scale=0.5] [--out=path]');
  process.exit(2);
}

function findBrowser() {
  if (process.env.REMOTION_BROWSER_EXECUTABLE) return process.env.REMOTION_BROWSER_EXECUTABLE;
  const base = '/opt/pw-browsers';
  if (!existsSync(base)) return undefined;
  const shell = readdirSync(base).filter((d) => d.startsWith('chromium_headless_shell-')).sort().pop();
  const p = shell && path.join(base, shell, 'chrome-linux', 'headless_shell');
  return p && existsSync(p) ? p : undefined;
}

const gen = (extra) => execFileSync('node', [path.join(root, 'scripts', 'gen-registry.mjs'), ...extra], { stdio: 'inherit' });

const browserExecutable = findBrowser();
const stills = flag('still');
const concurrency = Number(flag('concurrency') || 4);
const timeoutInMilliseconds = 120000;

try {
  gen([`--group=${group}`]);
  const serveUrl = await bundle({ entryPoint: path.join(root, 'src', 'index.ts'), publicDir: path.join(root, '..', 'media') });
  const composition = await selectComposition({ serveUrl, id, browserExecutable, timeoutInMilliseconds });

  if (stills) {
    const scale = Number(flag('scale') || 0.5);
    for (const n of stills.split(',').map(Number)) {
      const output = path.join(root, 'out', 'stills', `${id}-f${n}.png`);
      await renderStill({ serveUrl, composition, frame: n, output, scale, browserExecutable, timeoutInMilliseconds, overwrite: true });
      console.log('wrote', path.relative(process.cwd(), output));
    }
  } else {
    const outputLocation = flag('out') || path.join(root, 'out', `${id}.mp4`);
    let last = -1;
    await renderMedia({
      serveUrl, composition, codec: 'h264', crf: 18, outputLocation, overwrite: true,
      browserExecutable, concurrency, timeoutInMilliseconds, scale: Number(flag('scale') || 1),
      onProgress: ({ progress }) => {
        const p = Math.floor(progress * 10);
        if (p !== last) { last = p; process.stdout.write(`${p * 10}% `); }
      },
    });
    console.log('\nwrote', path.relative(process.cwd(), outputLocation));
  }
} finally {
  gen([]);
}
