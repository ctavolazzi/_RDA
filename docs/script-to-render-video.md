# The "how this video was made" video (script-to-render)

A 60-second video, made on 2026-10-18, that shows how it was made: the first full run of the `script-to-render` skill
(`ctavolazzi/_workbench`, `.claude/skills/script-to-render/`). 1920x1080, 30 fps, 1800 frames, in the RDA look, narrated
by a free local voice (mix 3: Kokoro, since there is no `.env` and so no voice key) over effects and quiet music. CT's
ask: "Once you’re ready, output a finished video explaining the steps you took to make it". Mixes 1 and 2 were text-led.

| Mix | CT's words | What changed |
| --- | --- | --- |
| 1 | (the first version) | Music bed 0.8 carrying the audio, quiet effects |
| 2 | "Now your task is to add sound and quiet background music to the video" | Foley, effects x2, bed 0.3, `--static --lufs -19` (D19) |
| 3 | "I want a narrator por favor", then "a free one" | Kokoro narration, bed dips under each line, effects x1, default master to -16 (D20) |

## Rebuild it

From the repo root, after `cd remotion && npm ci` and `./venv/bin/pip install -r requirements.txt` once:

```
./venv/bin/python tools/narrate.py videos/script-to-render      # the voice clips; first run downloads Kokoro (353 MB)
cd remotion && node scripts/render-one.mjs script-to-render ScriptToRender > ../render.log 2>&1; echo "exit $?"; cd ..
python tools/master_audio.py remotion/out/ScriptToRender.mp4
cd remotion && node scripts/render-one.mjs script-to-render ScriptToRenderThumb --still 0 --scale=1 && cd ..
```

`narrate.py` prints each line's length in frames and says "unchanged" when it matches the committed `_vo.json`; the
clips are git-ignored (`*.wav`), so a fresh clone needs this step before a render. On 2026-10-18 a second run with a
fresh model download wrote byte-identical clips.

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
  _vo.json                 the narration: each line's text and measured length in frames (written by tools/narrate.py)
  _scenes/S1Open.tsx ... S10Outro.tsx   one scene per file; each exports its duration and every cue frame
media/projects/script-to-render/                 stills of S1 to S5 (for S6), the S7 defect crop, a copy of the 13 STEPS thumbnail,
                                                  vo/S1.wav ... vo/S10.wav (git-ignored, rebuilt by tools/narrate.py)
```

| Scene | Frames | What it says |
| --- | --- | --- |
| S1 Open | 0 to 149 | Claude Code made this video. Here is every step. With receipts. (The step rail appears.) |
| S2 Orient, brief | 150 to 359 | `rda idea` parks it; `ls .env` fails, so the voice is free and local; the format chips |
| S3 Script | 360 to 539 | Words before code: the first lines of `script.md` |
| S4 Plan | 540 to 749 | The ten scenes to scale with start frames; 1800 frames; every sound on an exported frame |
| S5 Design, build | 750 to 929 | Palette and type from the style bible; the real `ls _scenes/` |
| S6 Stills | 930 to 1139 | Five real stills, read; the real S7 defect they caught, circled |
| S7 Render, measure | 1140 to 1379 | The receipt: exit 0, 1800 frames, 60.0 s, -24.9 to -19.1 LUFS, -2.0 dBTP, 66 s; MEASURED |
| S8 Thumbnail, package | 1380 to 1559 | The thumbnail, then at a true 320 px; the working title |
| S9 Record, show | 1560 to 1709 | "Show me please", the host's words; the process ends with the video |
| S10 Outro | 1710 to 1799 | script-to-render. Every run makes the next one better. |

The step rail (13 answer bubbles, the skill's stages 0 to 12) is drawn by the composition; each bubble fills at a
frame its scene exports.

## Voice (mix 3, 2026-10-18)

CT: "I want a narrator por favor", then "a free one". No `.env`, so no ElevenLabs key. The narrator is Kokoro v1.0
(`kokoro-onnx`, weights and voices Apache 2.0, so the video can be monetized), voice `af_heart`, speed 1.0, run on the
CPU by `tools/narrate.py`. The model came from the kokoro-onnx GitHub release; Hugging Face is blocked in this container.

| Scene | Starts at (`SN_CUES.vo`) | Frames | Line |
| --- | --- | --- | --- |
| S1 | 10 (first line) | 104 | Claude Code made this video. Here's every step, with receipts. |
| S2 | 12 (headline) | 173 | First, check what you have. There's no voice key here, so this voice is a free one that runs locally. |
| S3 | 12 | 120 | Write the words before any code. Even this line was written there first. |
| S4 | 12 | 159 | Plan it to the frame. Every sound, this voice included, starts on a frame a scene exports. |
| S5 | 12 | 82 | Build from one shared kit, one file per scene. |
| S6 | 12 | 139 | Before the full render, read a still of every scene. That's where layout bugs show up. |
| S7 | 12 | 131 | Render, then measure. These numbers come from this video's own first render. |
| S8 | 12 | 95 | Every video ships with a thumbnail, checked at phone size. |
| S9 | 12 | 101 | Write it all down. Then show the video, not just a report. |
| S10 | 16 (8 after the closing hit) | 59 | Every run makes the next one better. |

The lines are the `Voice:` lines in `script/script.md`, written before the code. They say the gist of each scene; the
screen still carries every idea. Each fits its scene at the scenes' original lengths, so the plan, the 1800 frames and
S4's bar did not change. The tightest is S2 (12 + 173 = 185 of 210 frames). The composition refuses to render a line
that would run past its scene: planting S10's start at 40 (40 + 59 = 99 of 90) stopped a still render with "Voice line
S10 runs 9 frames past its scene".

**Mix:** voice at 1.0; effects back to their table levels (`FX` 1, was 2); bed 0.3 between lines, dipping to 0.35 of
itself under each line (`DUCK`, a 6-frame dip before the line, a 12-frame return after). Measured on layers rendered
alone (`inputProps.mute`): while the voice speaks it sits 18.1 dB (RMS) over the bed and 10.6 dB over the effects; the
loudest effect moments during lines (-23.7 dBFS, 50 ms) stay under the voice's 90th percentile (-21.0). First try
(`FX` 2, `DUCK` 0.5): 14.6 and 5.0 dB, effects as loud as the voice.

**Mastering:** default `master_audio.py` to -16 (D19's rule for a voiced video). Its dynamic `loudnorm` kept the
balance here (voice lines 5.6 dB over the gaps before and after), while `--static -16` limited 9% of 10 ms windows by
more than 1 dB and one transient by 15.5 dB. A voice gives `loudnorm` steady material; a quiet bed alone did not.

**What a voice changed on screen:** S2 said "No voice key here, so the words on screen carry it" and its chips ended
with "text-led". Both became untrue the moment a voice was added; they now say "so the voice is free and local" and
"free voice", and S6's S2 tile was re-rendered from the new S2 (frame 345) before render 1.

## Sound (mix 2, 2026-10-18)

CT, after the first version: "Now your task is to add sound and quiet background music to the video". A clarifying
question (narrator voice, louder effects, or his own voice) was declined, so the words were read literally: sounds you
can hear, music quietly underneath, no voice. Mix 1, kept below for the record, had the bed at 0.8 carrying the audio
and effects so low (0.15 to 0.3) that they barely cleared it.

Bed `docu-pluck` at 0.3 (`BED`), 20-frame fade in, 60-frame fade out. Effects at their level times 2 (`FX`), capped at
1.0. Every cue frame is exported by a scene, the rail's and the scene changes' included.

| Event | Sound | Level (x2, cap 1.0) |
| --- | --- | --- |
| Each scene change, S2 to S10 (9) | `whoosh-soft` | 0.35 |
| The three opening lines (S1) | `pop-reveal` | 0.3 |
| Red-pen underline (S1) and red-pen circle (S6) | `pencil-scribble`, cut to 22 frames | 0.55 |
| Rail appears (S1) | `pop-reveal` | 0.35 |
| Each rail bubble fills (13) | `ui-click-soft` | 0.22 |
| Typing a command (S2 twice, S5), cut to the typing | `keys-typing-soft` | 0.38 |
| Terminal outputs (S2, 2), `ls` listing (S5) | `ui-click-soft` | 0.3 |
| Chips (S2), swatches (S5), defect crop (S6), thumbnail (S8), quote card (S9) | `pop-reveal` | 0.45 |
| Script sheet appears (S3) | `page-flip` | 0.6 |
| Script lines (S3, 5), plan segments (S4, 10) | `ui-click-soft` | 0.16, 0.18 |
| Playhead sweep (S4), the one riser | `riser-soft`, cut to the sweep | 0.3 |
| Each still tile (S6, 5) | `camera-shutter` | 0.45 |
| Receipt rows (S7, 7), working title (S8) | `ui-click-soft` | 0.26 |
| MEASURED stamp (S7), the one verdict | `stamp-hit` | 0.7 |
| The 320 px thumbnail slides in (S8) | `whoosh-soft` | 0.45 |
| Closing line (S10) | `impact-soft` | 0.55 |

Audited against style bible section 7 (0.3): one stamp for one verdict, one riser, no chime (nothing passed), every
cue marks something on screen.

**Mastering:** `python tools/master_audio.py remotion/out/ScriptToRender.mp4 --static --lufs -19` (D19). Measured on
the master: music-only stretch (54.0 to 56.5 s) at -26.5 dBFS RMS against -21.2 in mix 1; the 20 loudest 50 ms windows
13.3 dB above it against 9.9 dB in mix 1.

Mix 1, for the record: bed 0.8; clicks 0.15 to 0.3, pops 0.22 to 0.28, stamp 0.55, whoosh 0.4, impact 0.4; mastered
by default `loudnorm` to -15.9 LUFS / -1.9 dBTP.

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

Run again for mix 2: render 1 at 66.1 s; frames 0 to 1177 and 1500 to 1799 hash identical, 1178 to 1379 carry the
numbers, 1380 to 1499 at 0.9988 or above (encoder carry-over to the keyframe at 1500); audio hash identical; the
master landed on the receipt (-19.1 LUFS, -2.0 dBTP). Against mix 1 the picture differs only in S7's numbers, plus
encoder noise: S4's rail band at SSIM 0.99998 or above, a boosted difference showing compression blocks, not content.

A third render after a code-only change (the rail's cue frames moved into the scene files) hashed identical to render 2
on all 1800 decoded frames and on the audio.

Mix 3, narrated: render 1 at 68.4 s, -23.0 LUFS, -3.6 dBFS peak; frames 0 to 1177 and 1500 to 1799 hash identical in
render 2, 1178 to 1379 carry the numbers, 1380 to 1499 at SSIM 0.9988 or above (encoder carry-over); audio hash
identical; render 2's master landed on the receipt (-16.1 LUFS, -1.5 dBTP, 1800 frames).

## What went wrong while making it, and the fixes

1. **Caught in stills (stage 6):** the S7 note sat 11 px under the receipt card, inside its shadow (moved down 32 px);
   S4's red playhead stayed parked on the bar's right edge after its sweep (now fades out); S2's four format chips
   wrapped to two lines (smaller chips). The S7 one is shown in S6, cropped from the before still.
2. **Caught in the thumbnail check:** the script sheet was half empty and the red underline ran past "receipts".
3. **An on-screen claim that was not quite true:** S4 says "Every sound sits on a frame a scene exports". The rail's
   14 cues were computed in the composition. Fixed in code (each scene exports its rail frames), not in the text;
   render 3 proved the output unchanged.
4. **The fact-check before this video** found the explainer hardcodes three cue frames; this video exports all of them.
5. **Mix 2, mastering:** default `master_audio.py` sent the quiet-bed mix through dynamic `loudnorm` (it falls back
   silently when the gain would cross the true-peak ceiling), which lifted the bed back up and halved the contrast.
   Then the static chain overshot to +6.5 dBTP after AAC: hard-limited clicks ring in the encoder. Fixed in the tool:
   `--static` (fixed gain, 16 kHz roll-off, limiter 2 dB under the ceiling, up to three passes), and the default mode now
   says when `loudnorm` went dynamic. Mix 1's master had gone dynamic too.
6. **The momentary meter misled:** a 400 ms window averages short clicks away, so effects looked level with the bed.
   A 50 ms RMS contrast (loudest windows against a music-only stretch) measured what the ear would hear.
7. **Mix 3, a voice made two on-screen claims false:** S2's "so the words on screen carry it" and its "text-led" chip.
   Caught by reading every claim against the change (stage 6), fixed in the scene, and S6's tile of S2 re-rendered.
8. **Mix 3, effects mixed for no voice:** at `FX` 2 the effects were only 5 dB under the voice. Measured on layers
   rendered alone, not guessed; `FX` 1 and a deeper dip in the bed fixed it.
9. **Mix 3, a hit on the first word:** S10's closing `impact-soft` and the voice's first syllable shared frame 8. Found
   in the cue audit; the line now starts at 16.
10. **Mix 3, the script's brief used `Voice:` as a label,** which `narrate.py` reads as a line to speak before any
    scene and refuses. The brief's label is now `Narrator:`.

## Numbers

| | Value |
| --- | --- |
| Frames, duration | 1800, 60.0 s (video stream) |
| Loudness as rendered (mix 3) | -23.0 LUFS, -3.6 dBFS peak (mix 2: -24.9, -0.7; mix 1: -21.8, -3.9) |
| Master (mix 3, default) | -16.1 LUFS integrated, -1.5 dBTP (mix 2: -19.1, -2.0 static; mix 1: -15.9, -1.9) |
| Voice over bed, over effects, while it speaks (mix 3) | 18.1 dB, 10.6 dB (RMS) |
| Music-only stretch, effects contrast (mix 2) | -26.5 dBFS RMS, 13.3 dB (mix 1: -21.2, 9.9 dB) |
| Narration | 10 lines, 1163 frames (38.8 s) of 1800 |
| Render time (render 1, wall clock, 4 vCPU cloud container) | 68.4 s (mix 2: 66.1 s; mix 1: 64.2 s) |
| Master file | 5.4 MB |
| Thumbnail A (face, Canva, made after the video) | 1280x720 |
| Thumbnail B (13 STEPS, shown in S8) | 1280x720, 73 KB |
