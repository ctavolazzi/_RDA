# The "how this video was made" video (script-to-render)

A 60-second video, made on 2026-10-18, that shows how it was made: the first full run of the `script-to-render` skill
(`ctavolazzi/_workbench`, `.claude/skills/script-to-render/`). 1920x1080, 30 fps, 1800 frames, text-led (no `.env`,
so no voice key), music bed plus SFX, in the RDA look. CT's ask: "Once you’re ready, output a finished video
explaining the steps you took to make it".

## Rebuild it

From the repo root, after `cd remotion && npm ci` once:

```
cd remotion && node scripts/render-one.mjs script-to-render ScriptToRender > ../render.log 2>&1; echo "exit $?"; cd ..
python tools/master_audio.py remotion/out/ScriptToRender.mp4
cd remotion && node scripts/render-one.mjs script-to-render ScriptToRenderThumb --still 0 --scale=1 && cd ..
```

The master lands at `remotion/out/ScriptToRender-master.mp4` (git-ignored). The receipt in S7 reads
`remotion/src/shots/script-to-render/_receipt.json`; a rebuild shows the numbers measured on 2026-10-18, so re-measure
(below) before claiming them for a new render.

## How it is built

```
videos/script-to-render/script/script.md        brief and script, written before any code
videos/script-to-render/packaging/               thumb-A.jpg (face, from Canva), thumb-B.jpg (13 STEPS), packaging.md
remotion/src/shots/script-to-render/
  ScriptToRender.tsx       composition: scene timeline, header strip, step rail, bed, cue sheet
  ScriptToRenderThumb.tsx  thumbnail A (1280x720)
  _receipt.json            S7's numbers, measured on render 1
  _scenes/S1Open.tsx ... S10Outro.tsx   one scene per file; each exports its duration and every cue frame
media/projects/script-to-render/                 stills of S1 to S5 (for S6), the S7 defect crop, a copy of the 13 STEPS thumbnail
```

| Scene | Frames | What it says |
| --- | --- | --- |
| S1 Open | 0 to 149 | Claude Code made this video. Here is every step. With receipts. (The step rail appears.) |
| S2 Orient, brief | 150 to 359 | `rda idea` parks it; `ls .env` fails, so text-led; the format chips |
| S3 Script | 360 to 539 | Words before code: the first lines of `script.md` |
| S4 Plan | 540 to 749 | The ten scenes to scale with start frames; 1800 frames; every sound on an exported frame |
| S5 Design, build | 750 to 929 | Palette and type from the style bible; the real `ls _scenes/` |
| S6 Stills | 930 to 1139 | Five real stills, read; the real S7 defect they caught, circled |
| S7 Render, measure | 1140 to 1379 | The receipt: exit 0, 1800 frames, 60.0 s, -21.8 to -15.9 LUFS, -1.9 dBTP, 64 s; MEASURED |
| S8 Thumbnail, package | 1380 to 1559 | The thumbnail, then at a true 320 px; the working title |
| S9 Record, show | 1560 to 1709 | "Show me please", the host's words; the process ends with the video |
| S10 Outro | 1710 to 1799 | script-to-render. Every run makes the next one better. |

The step rail (13 answer bubbles, the skill's stages 0 to 12) is drawn by the composition; each bubble fills at a
frame its scene exports.

## Sound cue sheet (audited before the mix)

Bed `docu-pluck` at 0.8, 20-frame fade in, 60-frame fade out. Every cue frame is exported by a scene.

| Event | Sound | Level |
| --- | --- | --- |
| Underline under "receipts" (S1) | `ui-click-soft` | 0.3 |
| Rail appears (S1) | `pop-reveal` | 0.24 |
| Each rail bubble fills (13) | `ui-click-soft` | 0.2 |
| Terminal outputs (S2, 2), `ls` listing (S5), receipt rows (S7, 7) | `ui-click-soft` | 0.22 to 0.25 |
| Plan segments (S4, 10) | `ui-click-soft` | 0.15 |
| Chips, script card, swatches, still tiles, defect crop, thumbnail, quote card | `pop-reveal` | 0.22 to 0.28 |
| Red-pen circle on the defect (S6) | `ui-click-soft` | 0.3 |
| MEASURED stamp (S7), the one verdict | `stamp-hit` | 0.55 |
| The 320 px thumbnail slides in (S8) | `whoosh-soft` | 0.4 |
| Closing line (S10) | `impact-soft` | 0.4 |

Checked against style bible section 7: one stamp for one verdict, no risers, no chime (nothing passed).

## The receipt method (numbers a video shows about itself)

A video cannot show measurements of a file that does not exist yet. So:

1. Render 1 with the receipt empty (S7 shows "pending"). Time it; check the exit code.
2. Measure render 1: `ffprobe` frame count and video-stream duration, `ebur128` loudness, then `master_audio.py`.
3. Write the numbers to `_receipt.json`. Render 2.
4. Prove render 2 changed nothing but the numbers. Per-frame SSIM against render 1: frames 0 to 1139 and 1500 to 1799
   at 1.0; 199 of S7's 240 frames changed; frames 1380 to 1499 at 0.9988 or above, which is the H.264 encoder carrying
   S7's change forward until the keyframe at frame 1500 (a 40x difference image shows only compression blocks).
   Audio identical (-21.8 LUFS, -3.9 dBFS peak both).
5. Master render 2 and confirm it lands on the receipt's numbers (-15.9 LUFS, -1.9 dBTP).

A third render after a code-only change (the rail's cue frames moved into the scene files) hashed identical to render 2
on all 1800 decoded frames and on the audio.

## What went wrong while making it, and the fixes

1. **Caught in stills (stage 6):** the S7 note sat 11 px under the receipt card, inside its shadow (moved down 32 px);
   S4's red playhead stayed parked on the bar's right edge after its sweep (now fades out); S2's four format chips
   wrapped to two lines (smaller chips). The S7 one is shown in S6, cropped from the before still.
2. **Caught in the thumbnail check:** the script sheet was half empty and the red underline ran past "receipts".
3. **An on-screen claim that was not quite true:** S4 says "Every sound sits on a frame a scene exports". The rail's
   14 cues were computed in the composition. Fixed in code (each scene exports its rail frames), not in the text;
   render 3 proved the output unchanged.
4. **The fact-check before this video** found the explainer hardcodes three cue frames; this video exports all of them.

## Numbers

| | Value |
| --- | --- |
| Frames, duration | 1800, 60.0 s (video stream) |
| Loudness as rendered | -21.8 LUFS, -3.9 dBFS peak |
| Master | -15.9 LUFS integrated, -1.9 dBTP (`master_audio.py` targets -16 / -1.5) |
| Render time (render 1, wall clock, 4 vCPU cloud container) | 64.2 s |
| Master file | 5.4 MB |
| Thumbnail A (face, Canva, made after the video) | 1280x720 |
| Thumbnail B (13 STEPS, shown in S8) | 1280x720, 73 KB |
