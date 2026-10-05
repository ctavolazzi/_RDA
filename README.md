# RDA: Rapid Domain Acquisition Challenge Series

A repeatable video format for rapid learning, exam-taking, and domain synthesis.

The host is not an expert. Each episode shows authentic first-time exposure to a domain, a fixed
study window, a real pass/fail exam with stakes, and then a transparent technical debrief of what
the exam actually tested. Entertainment first, analysis second, and the two are clearly separated.

The goal is a low-overhead series that pairs dynamic storytelling with a genuine educational
takeaway, and that can be produced again and again with the same machinery.

**This repo is the home base.** It holds the format, every episode from idea to result, the `rda`
tool that runs an episode, and the full video production pipeline (cut, visuals, sound, packaging,
mastering, upload), so a video can go from idea to YouTube without leaving it. New here, human or
Claude: read [CLAUDE.md](CLAUDE.md), run `python tools/rda.py status`, and read the latest entry in
[docs/history/](docs/history/).

## The format at a glance

| # | Phase | Runtime | Job |
|---|---|---|---|
| 1 | Hook and constraints | 0:00 to 0:45 | Name the exam, the clock, and the honest baseline |
| 2 | Stakes and incentives | 0:45 to 1:15 | Pass reward and fail punishment, both stated up front |
| 3 | Test and immediate result | 1:15 to 2:00 | Score reveal, reaction, payoff b-roll |
| 4 | Technical synthesis | 2:00 to 8:00 | Surprising concepts, cross-domain patterns, core knowledge |
| 5 | Sponsor and outro | 8:00 to end | Disclosed sponsor read, next-episode seed |

Target length is roughly 9 to 10 minutes. Full spec: [docs/format.md](docs/format.md).

## The tool

One stdlib-only Python script runs an episode from idea to handoff. Run it from the repo root; it
needs no API keys and works on Windows and macOS.

```
python tools/rda.py status                      # where things stand and the next step. Start here.
python tools/rda.py idea "<text>"               # park an idea in docs/ideas.md, no ceremony
python tools/rda.py new <slug>                  # scaffold episodes/NNN-<slug>/ from the template
python tools/rda.py exam freeze                 # validate exam.json, hash it, seal the key, fill the card
python tools/rda.py exam check                  # prove on camera the exam has not changed
python tools/rda.py clock start <minutes>       # the visible countdown for the screen capture
python tools/rda.py clock stop                  # record when the test finished
python tools/rda.py score                       # enter answers, get the on-camera score block
python tools/rda.py handoff                     # scaffold videos/rda-NNN/ and export work/episode.json
python tools/rda.py log "<text>"                # dated receipt in the episode log
python tools/test_rda.py                        # the checks, with planted-bad-input controls
```

`status` reads what is on disk, so it works whatever order things happened in.

## Making the video

The production pipeline (vendored from claude-youtube-editor, MIT; see [docs/vendored.md](docs/vendored.md))
runs from the repo root. One-time setup: a Python venv with `requirements.txt`, `cd remotion && npm ci`,
`ffmpeg` and `node` on PATH, and a `.env` copied from `.env.example` for the keys you need.

| Step | How |
|---|---|
| Cut the talking head | `/clean-cut` |
| Build the visual beats | `/make-tsx` (and `/fake-screencast`), shots in `remotion/src/shots/` |
| Clean the voice | `/clean-audio` |
| Sound design | `/suggest-sfx` |
| Title and thumbnails | `/packaging`, `/thumbnail` |
| Render one composition | `cd remotion && node scripts/render-one.mjs <folder> <CompositionId>` |
| Master the loudness | `python tools/master_audio.py <video.mp4>` |
| Upload a private draft | `python tools/yt_upload.py upload <plan.json>` (OAuth, see `tools/yt_upload_SETUP.md`) |

The first thing made with it is a 60-second explainer of this kit:
[docs/explainer-video.md](docs/explainer-video.md).

## Repo map

```
README.md                  this file
CLAUDE.md                  how we work here, the formula on one page, the hard rules, the gotchas
tools/rda.py               the episode tool; tools/test_rda.py its checks
tools/master_audio.py      loudness mastering before upload
tools/                     the rest of the production pipeline (transcribe, cut, bake, SFX, upload, ...)
remotion/                  the Remotion project; shots in remotion/src/shots/<folder>/
media/                     library (SFX, music, logos) and per-video media
videos/                    production data per episode, created by rda handoff
episodes/
  _template/               copied by rda new (script, exam card, shot list, debrief, result)
schemas/
  exam.schema.json         the shape of a frozen exam file (real or generated)
docs/
  format.md                the five-phase arc, beat by beat, plus the viewer contract
  exam-sourcing.md         real exams first, AI-generated exams with a verified answer key second
  production.md            assets, where each file lives, the handoff, recording order
  risks.md                 risk register with a mitigation for each risk
  backlog.md               candidate domains and the rubric for picking the next one
  decisions.md             what we decided, why, and what would make us revisit it
  history/                 dated session records: what we did, found, and got wrong
  explainer-video.md       how the explainer is built, rendered, and what went wrong making it
  vendored.md              where the pipeline came from and what we changed in it
  site/rda-kit.html        source of the RDA Episode Kit page
.claude/skills/            the pipeline skills
LICENSES/                  MIT notice for the vendored pipeline
```

## How an episode moves

```
pick domain  ->  source or generate exam  ->  freeze exam  ->  study window  ->  take test
     (backlog)        (exam-sourcing)          (hash + commit)     (timed)        (screen capture)
                                                                                        |
   upload  <-  packaging  <-  SFX  <-  visuals  <-  clean cut  <-  record talking head  <-+
```

Pre-production lives in `episodes/NNN-slug/`. Once the exam is taken and footage exists,
`rda handoff` creates `videos/rda-NNN/` and production continues there, in this same repo. The
handoff rule is in [docs/production.md](docs/production.md).

## Status

No episode has been made yet. The first step is to pick episode 001 from
[docs/backlog.md](docs/backlog.md) and run `python tools/rda.py new <slug>`.

Open items (full list in [docs/history/2026-10-05.md](docs/history/2026-10-05.md)): pick episode 001's
exam, adopt the RDA look as the brand with `/brand-setup`, narration for the explainer, LLM exam
generation with blind key verification (protocol in [docs/exam-sourcing.md](docs/exam-sourcing.md)),
and episode cards that read `work/episode.json`.
