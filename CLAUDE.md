# CLAUDE.md, _RDA

This repo is the **home base** for the **Rapid Domain Acquisition (RDA) Challenge** series: the host
studies a domain from zero inside a fixed window, takes a real exam with pass/fail stakes, then gives
a first-timer's debrief. Everything lives here: the formula, the per-episode state, the `rda` tool,
and the full video production pipeline (cut, visuals, sound, packaging, upload).

**New session? Read this file, then run `python tools/rda.py status`, then skim the latest entry in
`docs/history/`.** That is enough to pick up where the last session stopped.

## How we work

Ideas arrive at random and out of order. The tool is built for that: it reads what is on disk and
says where things stand.

- When the user shares an idea, park it first: `python tools/rda.py idea "..."`. Then talk about it.
- When something happens off camera (footage shot, exam sourced, prop bought), log it:
  `python tools/rda.py log "..."`, so the record matches reality.
- At the end of a working session, add or extend an entry in `docs/history/` (what we did, why, what
  we found, what we got wrong) and add any decision worth remembering to `docs/decisions.md`.
- The user does not want PRs watched: never subscribe to PR activity or schedule PR check-ins unless
  they ask. If the harness auto-subscribes, unsubscribe.
- No em dashes or en dashes anywhere: docs, scripts, tool output, on-screen text. User preference.
- **Every video gets a thumbnail.** Making a video (an episode, an explainer, a short, anything) is not done
  until its thumbnail exists, follows `docs/style-bible.md` section 8, and has been checked at 320 px wide.
  Save it as `videos/<project>/packaging/thumb-A.jpg` (or render with `/thumbnail` into `packaging/thumbs/`).
  `rda status` will not say "finish and ship" until it finds one. User rule, 2026-10-05.

## Layout

```
tools/rda.py              the episode tool (idea, new, status, log, exam freeze|check, clock, score, handoff)
tools/test_rda.py         its checks, with planted-bad-input controls. Run after touching rda.py
tools/master_audio.py     last step before upload: loudness to -16 LUFS / -1.5 dBTP, video copied
remotion/src/lib/rda.tsx  the RDA look as code (colors, fonts, motion, Bubble, Stamp, Terminal). Use it for every RDA shot
tools/*.py, *.mjs         the production pipeline (vendored, see docs/vendored.md)
remotion/                 the Remotion project. Shots in remotion/src/shots/<group>/; registry is GENERATED
  scripts/render-one.mjs  render one composition from one shot folder (bundles only that folder)
media/library/            reusable SFX, music, logos (each with a catalog). Faces are yours, git-ignored
media/projects/<p>/       media for ONE video, via staticFile('projects/<p>/x')
videos/rda-NNN/           production data for an episode once handed off (cuts, transcripts, timeline)
episodes/NNN-slug/        pre-production for an episode: exam, key, card, result, log, script draft
episodes/_template/       copied by `rda new`
schemas/exam.schema.json  shape of a frozen exam
docs/style-bible.md       the living style guide: colors, type, motion, sound, thumbnails. Read before making visuals
docs/                     format, exam sourcing, production, risks, backlog, ideas, decisions, history
HANDOFF.txt               paste-ready prompt to resume this work in a new chat
.claude/skills/           the pipeline skills (/clean-cut, /make-tsx, /suggest-sfx, /packaging, ...)
LICENSES/                 the MIT notice for the vendored pipeline
```

## The formula, one page

1. **Idea** goes in `docs/ideas.md`. Score it against the rubric in `docs/backlog.md` before it becomes an episode.
2. **`rda new <slug>`** scaffolds `episodes/NNN-slug/`.
3. **Exam card** (`exam/exam-card.md`): exam, source, rights check, time limit, pass line, stakes, sponsor.
4. **Exam file** (`exam/exam.json`) matching `schemas/exam.schema.json`. Real exam first; see `docs/exam-sourcing.md`.
   Claude can build it from a PDF and its key so the host never sees the answers.
5. **`rda exam freeze`** validates it, writes the SHA-256 into the card and `result.json`, seals the key into
   `exam/key.json`, and writes `exam/questions.md` (the only exam file the host reads). **Commit `exam/` before
   studying.** `rda exam check` proves on camera that nothing changed.
6. **Record B1 and B2** (hook, baseline, stakes) before studying, so they are true when said.
7. **`rda clock start <minutes>`** on the screen capture: the visible clock, with real timestamps.
8. Take the test. **`rda clock stop`**, then **`rda score`**: the score block it prints is the on-camera result.
9. **Film the payoff that actually happened.** Set `payoff.filmed` in `result.json`.
10. **Debrief outline** (`debrief.md`) from what the exam actually tested, then **`script/script.md`**.
11. **`rda handoff`** scaffolds `videos/rda-NNN/` in this repo with the script, `notion.json`, and
    `work/episode.json` (score, pass line, timings, topic tally for the cards).
12. **Produce:** `/clean-cut`, `/make-tsx`, `/clean-audio`, `/suggest-sfx`.
13. **Thumbnail, always:** `/thumbnail` (with the face kit and a Gemini key) or a Remotion still in the RDA look,
    saved to `videos/rda-NNN/packaging/`, checked at 320 px. Then `/packaging` for the title and description.
14. **Ship:** `tools/master_audio.py`, then `tools/yt_upload.py` with the thumbnail in the upload plan. Set
    YouTube's paid promotion toggle by hand if sponsored.

Full arc and viewer contract: `docs/format.md`. Risks: `docs/risks.md`. Production detail: `docs/production.md`.

## Hard rules, the series

- **A frozen exam never changes.** If it must, that is a new episode folder, not an edit.
- **Nothing estimated is written as measured.** Timestamps come from the tool. The score comes from `rda score`.
- **The pass line is set before the test and never moved.**
- **Stakes and payoffs are real.** Film only the outcome that happened.
- **Sample data is labeled as sample** wherever it appears on screen (the explainer's score card does this).

## Hard rules, the pipeline (from claude-youtube-editor's CLAUDE.md, still true here)

- **Run everything from the repo root.** Tools resolve engine paths (media/library, catalogs, remotion/out)
  against their own location and project paths against the CWD: `python tools/render_cuts.py videos/rda-001 ...`.
- **Python: a venv at the repo root.** `python -m venv venv`, then `venv/Scripts/python -m pip install -r
  requirements.txt` (Windows) or `./venv/bin/pip install -r requirements.txt`. A `ModuleNotFoundError` for
  requests, Pillow or google-* means you are not on the venv. `tools/rda.py` and `tools/master_audio.py`
  need no venv. `ffmpeg`/`ffprobe` and `node`/`npx` must be on PATH.
- **API keys** live in `.env` at the repo root (copy `.env.example`), never committed. `ASSEMBLYAI_API_KEY`
  transcription, `ELEVENLABS_API_KEY` voice isolation, SFX, music, voiceover, `GEMINI_API_KEY` thumbnails,
  `NOTION_TOKEN` + `NOTION_LONGS_PAGE_ID` the tracker. YouTube uses OAuth: see `tools/yt_upload_SETUP.md`.
- **Notion is the tracker, the repo is the source of truth.** `python tools/notion_sync.py videos/<p> --apply`
  is a dry run without `--apply` and matches an existing row before creating one. Never hand-edit the
  script in Notion.
- **The Remotion registry is generated:** after adding or renaming a shot, `cd remotion && npm run gen`.
  Files without a `compositionConfig` (helpers like the explainer's `_scenes/`) are skipped on purpose.
- **Media rules:** `media/library/` is for cross-video reusable assets only, each with a catalog. Anything for
  one video goes in `media/projects/<p>/`. Reuse before you generate.
- **Committed vs ignored:** commit the reproducible pipeline (cuts.json, plans, timelines, transcripts, TSX,
  SFX plans, catalogs, library clips). Never commit raw footage, master cuts, renders, audio work files,
  or face images. `.gitignore` covers it, including a blanket `*.mp4`.
- **QA is not optional:** render frames and READ them before calling a shot done; run `verify_cut.py` on
  every cut render; audit the SFX cue sheet before mixing; measure loudness before upload.
- **The brand contract is three files:** `brand.md`, `remotion/src/brand.ts`, `remotion/src/fonts.ts`.
  Change them together or run `/brand-setup`. They still hold the upstream house style (indigo), NOT the
  RDA look. The RDA look lives in `remotion/src/lib/rda.tsx` and `docs/style-bible.md` until `/brand-setup` adopts it.

## Gotchas we hit (2026-10-05), so you don't hit them again

- **Rendering in a sandbox:** `remotion/src/fonts.ts` loads Google Fonts over the network at render time.
  Behind the cloud proxy, headless Chrome rejects the proxy's certificate, so any bundle that includes the
  example shots fails. Use `node scripts/render-one.mjs <group> <Id>`, which bundles one shot folder. Never
  disable TLS verification to get around it. On the user's own machine this is not an issue.
- **Fonts for RDA shots are local files** in `media/library/fonts/rda/`, loaded by `remotion/src/lib/rda.tsx` with `FontFace` +
  `delayRender` (120s timeout; the 30s default expired in parallel render tabs).
- **No voice means the music carries the audio.** Library clips sit near -20 LUFS; a bed at 0.2 gave a
  -32 LUFS export. Always finish with `tools/master_audio.py`.
- **A pipe hides exit codes.** `cmd | tail` reports tail's exit status. Capture to a log file, then check `$?`.
- **The Write tool turns unicode escapes into literal characters.** A backslash-u escape for the en dash
  (code point 2013) is written out as the dash itself. In code that must not contain dashes, use
  `chr(0x2013)`.

## Not built yet

See `docs/history/2026-10-05.md`, "Open items". In short: pick episode 001's exam (it decides whether an
external-scorer mode is needed), adopt the RDA look as the brand, narration for the explainer, LLM exam
generation with blind verification, and episode cards that read `work/episode.json`.
