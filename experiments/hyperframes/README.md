# HyperFrames bake-off (2026-10-18)

[HyperFrames](https://github.com/heygen-com/hyperframes) is HeyGen's open-source (Apache 2.0) renderer
that turns HTML, CSS and seekable animation (GSAP, CSS, Lottie, Three.js) into MP4. Like Remotion, it
drives headless Chrome frame by frame and encodes with FFmpeg. Unlike Remotion, a shot is a plain HTML
file, not a React component, and there is no bundle step.

The question: could it replace Remotion in this pipeline, or do part of its job better? To answer with
measurements instead of the project's README, scene S5 of the RDA explainer (the 12-second
`rda status` / `rda score` beat) was ported by hand and rendered both ways.

**Verdict: keep Remotion. No migration.** See decision D24 in `docs/decisions.md`.

## What is here

| File | What |
|---|---|
| `s5-tool.html` | S5 ported 1:1 from `remotion/src/shots/rda-explainer/_scenes/S5Tool.tsx`: same tokens, timings, easing curves, fonts, SFX cues and music bed |
| `stamp-overlay.html` | the Pass stamp on a transparent page, to test alpha output |
| `bakeoff.mjs` | builds both HyperFrames projects, renders S5 both ways and the stamp as `.mov`, compares, writes `summary.json` |
| `thumb-A.jpg` | thumbnail for the side-by-side comparison clip, made after the fact (CT's rule covers every video); source `remotion/src/shots/experiments/BakeoffThumb.tsx` |

Rerun from the repo root (needs `npm ci` in `remotion/`, ffmpeg, node 22+, network for npx):

```
node experiments/hyperframes/bakeoff.mjs
```

Output lands in `remotion/out/hyperframes-bakeoff/` (git-ignored), with three side-by-side PNGs to read.
HyperFrames telemetry is off for every call the script makes.

## Results (measured 2026-10-18)

Cloud container: 4 vCPU Xeon at 2.1 GHz, 15.7 GB RAM, software rendering (no GPU), Playwright's Chromium
headless shell, ffmpeg 6.1.1, node 22.22.0. HyperFrames 0.8.171, Remotion as pinned in `remotion/`.

| | HyperFrames | Remotion |
|---|---|---|
| Frames (1920x1080, 30 fps) | 360 | 360 |
| Render, 4 workers | 17.3 s (whole CLI call) | 12.8 s, plus 1.4 s bundle (5.7 s cold) |
| Loudness, integrated / peak | -20.7 LUFS / -5.4 dBFS | -20.7 LUFS / -5.5 dBFS |
| SSIM between the two, all 360 frames | mean 0.994, lowest 0.987 (frame 159) | |
| Alpha `.mov` for `bake.py` overlays | ProRes 4444, `yuva444p12le`, composites cleanly | ProRes 4444 (current path) |

What the numbers mean:

- **Same picture.** The remaining SSIM gap is anti-aliasing at glyph edges; read side by side, the frames
  are the same, down to the typed command showing `$ rda sta` on the same frame.
- **Same sound.** Both mixes land within 0.1 dB.
- **Same speed, near enough.** One earlier run had HyperFrames at 15.1 s and Remotion at 14.8 s plus a
  cold 5.7 s bundle. Neither engine is a reason to switch on speed.
- **It would slot into `bake.py` unchanged** for cutaways (`.mp4`) and overlays (`.mov` with alpha).
- **`hyperframes check`** passed the port: lint clean, layout clean, motion clean, 87 of 87 text checks at
  WCAG AA contrast. Its 8 warnings were SFX slots longer than the clips, same as the Remotion version.

## Why not switch

- The RDA look already exists as code (`remotion/src/lib/rda.tsx`), and so do the explainer, its
  thumbnail, `render-one.mjs`, and the `/make-tsx`, `/fake-screencast` and `vidtsx-2d-generator` skills.
  Porting all of it buys the same pictures.
- Remotion's free license covers individuals and for-profit companies with up to 3 employees
  (`remotion/node_modules/remotion/LICENSE.md`), so it costs nothing today.
- HyperFrames is pre-1.0 (0.8.171) and releases almost daily. Fine for an experiment, a moving target for
  a production pipeline.

## What it could still add (not tested here)

- **Narration without an API key.** `hyperframes tts` runs Kokoro-82M locally (`pip install kokoro-onnx
  soundfile`). The explainer is text-only because there is no ElevenLabs key (open item 3 in
  `docs/history/2026-10-05.md`). Worth one trial render to judge the voice.
- **Transcription without an API key.** `hyperframes transcribe` uses whisper.cpp locally, an alternative to
  AssemblyAI for `/clean-cut`. Needs whisper.cpp built.
- **A contrast gate.** `check` measures WCAG contrast on every text element. It only works on HyperFrames
  compositions.

## Gotchas found on the way

1. **GSAP callbacks do not run during a render.** The runtime seeks with `suppressEvents`, so `onUpdate`
   and `onComplete` never fire. A first version typed the command from an `onUpdate` counter and would have
   rendered an empty prompt. Drive everything from tweened properties or `tl.set` (the port shows one span
   per character), or use GSAP's TextPlugin as HyperFrames' own skill recommends.
2. **Page CSS can beat a component class.** A `.side p` rule silently overrode `.eyebrow`, so the eyebrow
   rendered in the body font. React inline styles cannot collide like that. The SSIM comparison caught it
   (those frames scored 0.949); a quick look had not.
3. **Telemetry is on by default** (anonymous, PostHog). Opt out with `HYPERFRAMES_NO_TELEMETRY=1` or
   `npx hyperframes telemetry disable`. `init` also checks skills on GitHub unless `HYPERFRAMES_SKIP_SKILLS=1`.
4. **The scaffold loads GSAP from a CDN.** For renders that never wait on the network (the same rule as
   the RDA fonts), ship it locally, as `bakeoff.mjs` does. GSAP is free for commercial use under
   GreenSock's own "standard no-charge" license, which is not an open-source license; HyperFrames itself is.
5. **Pin the version.** The scaffold pins an exact `hyperframes@X.Y.Z`; keep it that way.
