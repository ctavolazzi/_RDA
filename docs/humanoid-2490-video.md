# The $2,490 humanoid video (humanoid-2490), first cut

A 2:29 current-event explainer, made 2026-10-18 from `docs/current-event-video.md`. CT: "Carefully consider how to
make an actually genuinely engaging video about a current event. Complete with overlays, fair use footage, cutouts,
transitions, interview clips, and more", then "Give it a shot". 1920x1080, 30 fps, 4458 frames, in the RDA paper look
with the new news kit (`remotion/src/lib/news.tsx`), a scratch narrator (Kokoro) and three library tracks.

**What this cut is, and is not.** Everything that could be made here is made: script with sourced claims, narration,
eleven scenes of overlays and paper cutouts, diagrams to scale, charts, transitions, sound, thumbnail, packaging. What
needs the real world is a marked slot, not a fake: no footage host reaches this container (D21), and CT's camera and
the interviews are his. The slots are listed at the end of `videos/humanoid-2490/script/script.md`.

## Rebuild it

From the repo root, after `cd remotion && npm ci` and `./venv/bin/pip install -r requirements.txt` once:

```
./venv/bin/python tools/narrate.py videos/humanoid-2490          # 37 clips; prints "unchanged" when lengths match _vo.json
cd remotion && node scripts/render-one.mjs humanoid-2490 Humanoid2490 > ../render.log 2>&1; echo "exit $?"; cd ..
python tools/master_audio.py remotion/out/Humanoid2490.mp4
cd remotion && node scripts/render-one.mjs humanoid-2490 Humanoid2490Thumb --still 0 --scale=1 && cd ..
```

To re-voice in CT's own voice: record each `Voice:` line of the script as its own WAV with the same name
(`media/projects/humanoid-2490/vo/S3.2.wav` and so on), update the frame counts in `_vo.json`, and render. Every scene
re-times itself from those lengths.

## How it is built

```
videos/humanoid-2490/script/script.md        brief, claims table with sources, script with Voice: lines, slots
videos/humanoid-2490/packaging/               thumb-A.jpg ("THAT'S IT?"), packaging.md (title, description with sources)
remotion/src/lib/news.tsx                    the news kit: PriceTag, HeadlineStrip, SourceTag, PenPath, CountUp, Check,
                                             ChapterSlide, RobotFigure, PersonFigure, Ruler, BarRow, icons, Drift
remotion/src/shots/humanoid-2490/
  Humanoid2490.tsx         composition: scenes, chrome, voice, three music acts with ducking, cue sheet
  Humanoid2490Thumb.tsx    thumbnail A
  _layout.ts               each scene's voice lines laid end to end from _vo.json; cueAt() for "when is this phrase said"
  _vo.json                 the narration's measured lengths (written by tools/narrate.py)
  _scenes/S1Open.tsx ... S11Payoff.tsx
media/projects/humanoid-2490/vo/              the clips (git-ignored)
```

Scene lengths are not typed in: each is its lines' measured lengths plus a 12-frame lead, 9 frames between lines (and
any pause written into the scene) and an 18-frame tail. Visual beats land on the sentence that names them, or on a
phrase inside it (`cueAt`, an estimate from the share of characters before the phrase, used for timing only).

| Scene | Starts (rounded down) | What it shows |
| --- | --- | --- |
| S1 Cold open | 0:00 | "Humanoid robot" card, the $2,490 tag slaps on, red pen circles it; three real headlines as cutouts, each price underlined |
| S2 Hook | 0:08 | "There's a catch."; the three firms' totals as question cards |
| S3 What launched | 0:18 | FF Nova specs line by line; the diagram's 20 joints light up, it waves, tips over and gets back up on the words |
| S4 The catch | 0:43 | The robot shrinks to scale beside a ruler and a 175 cm adult: 49.7 cm, knee high; 2.8 kg against a gallon of milk |
| S5 Who it is for | 0:53 | Built for classrooms and developers; "your kitchen" struck through |
| S6 How many | 1:06 | Chapter slide; three bars to one scale; a red bracket, about 5,900 apart |
| S7 What for | 1:26 | IDC 69% research, education, shows, government data collection against Smart Analytics Global over 70% industrial and commercial |
| S8 China | 1:45 | About 78% bought in China, over 95% built by Chinese companies: different questions |
| S9 Chores | 1:56 | NOT YET on a household humanoid; vacuums, mowers, garden robots checked; disclosure |
| S10 What to watch | 2:11 | Nova past its first 100; full-year forecasts over 50,000 and about 60,000 |
| S11 Payoff | 2:21 | The robot tips and gets up again; "Cheap: yes. Useful at home: not yet." |

**Sound.** Voice at 1.0. Music in three acts, one 63 s track each: `docu-pluck` enters on the tag's slap (so act 1
fits its track) and fades before the chapter slide, `tech-pulse` starts on the slide, `cinematic-min` plays its last
32 s so it ends with the video. Bed 0.3, dipping to 0.35 of itself under every line. Effects at the style bible's
levels: one stamp (NOT YET), one riser (into the shrink), pen strokes for every red mark, clicks for checks, pops for
cards, whooshes at scene changes.

## Numbers

| | Value |
| --- | --- |
| Frames, duration | 4458, 148.6 s (as planned from the measured voice) |
| Narration | 37 lines, 29 to 213 frames each |
| Render | exit 0, 200.6 s wall clock (4 vCPU cloud container) |
| Loudness as rendered | -22.5 LUFS, -3.2 dBFS peak |
| Master (default `master_audio.py`) | -16.0 LUFS, -1.8 dBTP, 13.8 MB; voice 7.4 dB over the gaps after mastering (7.5 before) |
| Voice over bed, over effects, while it speaks | 17.3 dB, 15.2 dB (RMS, layers rendered alone) |
| Thumbnail | 1280x720, 68 KB, checked at 320 px |

## What went wrong, and the fixes

1. **Stills (stage 6):** S5's strike landed 22 frames before the scene ended and was still drawing (now on the word,
   with a 40-frame tail); S11's last line ran past the margin (two lines now); S3's wave and fall overlapped (wave
   shortened); S4's "49.7 cm" appeared while the robot was still shrinking (now after); S2 left the lower third empty.
2. **The render failed at 118 s, twice, near frame 2840.** Not the content: frames 0 to 600 and 2500 to 3000 rendered
   alone. Verbose logs showed every tab rendering until the RDA kit's font hold timed out. The bundle carries two
   copies of Remotion's delay-render module (`remotion` and `remotion/no-react`, the second pulled in by
   `@remotion/google-fonts`), and the second to load resets the list of holds, orphaning the kit's module-level hold:
   it never blocked a frame and its timer killed any render past about two minutes. The 60 s videos finished first.
   Fix in `remotion/src/lib/rda.tsx`: fonts start loading at module load, the hold is taken by `useRdaFonts()` on the
   first render (PaperChrome, Scene and each thumbnail call it). The earlier video's still and thumbnail re-rendered
   pixel-identical; this video then rendered in full.
3. **Facts:** the first plan had two shipment counts; checking found a third (Counterpoint) and showed the two China
   figures answer different questions (buyers against builders). Both became beats.
