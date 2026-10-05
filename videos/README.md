# videos/

**This is where episodes go once they are in production.** `python tools/rda.py handoff` creates
`videos/rda-NNN/` for you. (This README came with the vendored pipeline; its `video-1` examples read as `rda-001`.)

One folder per video — `video-1/`, `video-2/`, … The skills create the structure for you; you don't
need to make it by hand. Drop your raw recording in and ask Claude Code to cut it:

```
videos/video-1/
├─ DJI_0233.MP4                  your raw talking-head footage (git-ignored)
├─ script/                       optional — your script/plan, if you write one
├─ work/
│  ├─ keyterms.txt               brand/tech names, so the transcript spells them right
│  ├─ analysis/cuts.json         the cut you authored from the transcript
│  ├─ edited-transcript.json     word times in the master — how visuals sync to speech
│  ├─ timeline.json              which shot composites where
│  └─ sfx-plan.json              the sound design
├─ reference/                    the master cut (git-ignored — big)
└─ packaging/                    titles, description, thumbnails
```

**Nothing here is committed by default.** `.gitignore` keeps raw footage, master cuts, and renders
out of git — this repo carries the *reproducible pipeline* (plans, cuts, transcripts, shots), not
your camera files. That's deliberate: the plans are small and diffable, the footage is not.

## Where's the example?

The worked example is **37 Remotion shots** in `remotion/src/shots/example/` — the visual beats from
a real published video. They render standalone, no footage required:

```bash
cd remotion && npm run studio
```

That's the fastest way to see what this pipeline produces and what the kit in `remotion/src/lib/`
gives you. Read a few before building your own.

The example's footage, script, and packaging aren't here — only the code that made its visuals.
