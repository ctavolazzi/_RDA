# The RDA explainer video

A 60-second animated explainer of the RDA kit, made on 2026-10-05. 1920x1080, 30fps, text-led (no
narration), music bed plus SFX, in the same exam-booklet look as the kit page (`docs/site/rda-kit.html`).

## Rebuild it

From the repo root, after `cd remotion && npm ci` once:

```
cd remotion && node scripts/render-one.mjs rda-explainer RdaExplainer && cd ..
python tools/master_audio.py remotion/out/RdaExplainer.mp4
```

The master lands at `remotion/out/RdaExplainer-master.mp4` (git-ignored, like every render). Stills for
QA: `node scripts/render-one.mjs rda-explainer RdaExplainer --still 90,380,950,1410`.

## How it is built

```
remotion/src/shots/rda-explainer/
  RdaExplainer.tsx     the composition: scene timeline, paper header strip, music bed, SFX cue sheet
  _kit.tsx             palette, local fonts, motion helpers, Bubble, Stamp, Terminal, PaperChrome
  _scenes/S1Open.tsx ... S7Outro.tsx   one scene per file
media/projects/rda-explainer/fonts/    Bricolage Grotesque, Source Sans 3, IBM Plex Mono (OFL)
```

| Scene | Frames | What it says |
|---|---|---|
| S1 Open | 0 to 180 | Learn a field from zero. Take the real exam. Live with the result. Then the RDA title |
| S2 Format | 180 to 540 | The five-phase bar, to scale, with three highlights |
| S3 Promise | 540 to 720 | The clock is real; the exam is locked first; the score comes from the scorer |
| S4 Seal | 720 to 1080 | `exam.json` through `rda exam freeze` into three files; `rda exam check` OK |
| S5 Tool | 1080 to 1440 | `rda status` checklist, then `rda score`: 8 of 10, PASS (labeled sample data) |
| S6 Handoff | 1440 to 1620 | `rda handoff` carries `episode.json` into production |
| S7 Outro | 1620 to 1800 | `rda idea "your idea"`, then "Bring an idea." |

Each scene exports its duration and its cue frames; the composition builds the SFX cue sheet from
them, so retiming a scene moves its sound with it. Helper files have no `compositionConfig`, so the
registry lists only `RdaExplainer`.

Note: S6 still shows two repos (`_RDA` and `claude-youtube-editor`). That was true when it was made;
since the consolidation both live here. Update the scene if the video is reused publicly.

## What went wrong while making it, and the fixes

1. **Layout, found by reading stills:** the red-pen underline overran "result."; the PASS stamp covered
   the pass line; the `episode.json` chip overlapped a box border. Fixed and re-checked.
2. **Fonts over the network:** the bundle included every shot, and the example shots load Google Fonts;
   headless Chrome rejected the cloud proxy's certificate. Fix: RDA fonts are local files, and
   `render-one.mjs` bundles one shot folder.
3. **Font timeout in parallel tabs:** stills passed (one tab), the full render failed at frame 429 when a
   tab's `delayRender` hit 30s. Fix: 120s timeout on the font `delayRender`, concurrency 4. It still fails
   loudly rather than rendering in fallback fonts.
4. **Too quiet:** -32 LUFS, because the bed was set as if a voice sat on top. Fix: bed volume 0.8, then
   `tools/master_audio.py` to -16 LUFS / -1.5 dBTP.
5. **A failed render reported as success:** the render was piped into `grep`, which exited 0. Fix:
   log to a file and check the real exit code.

## Ideas for a next version

- Narration (ElevenLabs via `tools/gen_vo.mjs`, or the user's voice), then lower the bed.
- Update S6 for the single-repo home base.
- A vertical cut for Shorts (1080x1920): S1, S3 and S5 carry the idea on their own.
