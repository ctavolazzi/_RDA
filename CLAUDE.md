# CLAUDE.md, _RDA

This repo runs the **Rapid Domain Acquisition (RDA) Challenge** series: the host studies a domain
from zero inside a fixed window, takes a real exam with pass/fail stakes, then gives a first-timer's
debrief. The format is a repeatable formula. This repo holds the formula, the per-episode state, and
one tool that moves an episode through it.

## How we work here

Ideas arrive at random and out of order. The tool is built for that: it reads what is on disk and
says where things stand. **Start every session with:**

```
python tools/rda.py status
```

Then act on the `next:` line, or on whatever the user brought. When the user shares an idea, park it
first (`python tools/rda.py idea "..."`), then talk about it. When something happens off camera
(footage shot, exam sourced, prop bought), log it (`python tools/rda.py log "..."`) so the record
matches reality.

Stdlib Python only, run from the repo root, no API keys. Works on Windows and macOS.

## The formula, one page

1. **Idea** goes in `docs/ideas.md`. Score it against the rubric in `docs/backlog.md` before it becomes an episode.
2. **`rda new <slug>`** scaffolds `episodes/NNN-slug/` from `episodes/_template/`.
3. **Exam card** (`exam/exam-card.md`): exam, source, rights check, time limit, pass line, stakes, sponsor.
4. **Exam file** (`exam/exam.json`) matching `schemas/exam.schema.json`. Real exam first; see `docs/exam-sourcing.md`.
5. **`rda exam freeze`** validates it, writes the SHA-256 into the card and `result.json`, and seals
   the key into `exam/key.json`. **Commit `exam/` before studying.** The host never opens `key.json`
   (honor system, said plainly on camera). `rda exam check` proves the file has not changed.
6. **Record B1 and B2** (hook, baseline, stakes) before studying, so they are true at the time.
7. **`rda clock start <minutes>`** on the screen capture: the visible clock, with real timestamps.
8. Take the test. **`rda clock stop`**, then **`rda score`**: the score block it prints is the on-camera result.
9. **Film the payoff that actually happened.** Set `payoff.filmed` in `result.json`.
10. **Debrief outline** (`debrief.md`) from what the exam actually tested, then **`script/script.md`**.
11. **`rda handoff <path to claude-youtube-editor>`** scaffolds `videos/rda-NNN/` there with the script,
    `notion.json`, and `work/episode.json` (score, pass line, timings, topic tally for the cards).
12. Production happens in the pipeline repo: `/clean-cut`, `/make-tsx`, `/suggest-sfx`, `/packaging`,
    `tools/yt_upload.py`. Before publishing, set YouTube's paid promotion toggle by hand if there is a sponsor.

Full arc and viewer contract: `docs/format.md`. Risks: `docs/risks.md`.

## Hard rules

- **A frozen exam never changes.** If it must, that is a new episode folder, not an edit.
- **Nothing estimated is written as measured.** Timestamps come from the tool. The score comes from `rda score`.
- **The pass line is set before the test and never moved.**
- **No em dashes or en dashes** anywhere: docs, scripts, tool output. The pipeline's on-screen text rule applies here too.
- **Stakes and payoffs are real.** Film only the outcome that happened.
- **Run `python tools/test_rda.py` after touching `tools/rda.py`.** Its controls plant bad input and assert the tool refuses it.

## Layout

```
tools/rda.py          the tool (new, status, idea, log, exam freeze|check, clock start|stop, score, handoff)
tools/test_rda.py     its checks
docs/                 format, exam-sourcing, production, risks, backlog, ideas
schemas/              exam.schema.json
episodes/_template/   copied by rda new
episodes/NNN-slug/    one per episode: exam/, script/, debrief.md, shotlist.md, notion.json, result.json, LOG.md
```

## Not built yet

- LLM exam generation with blind key verification (protocol in `docs/exam-sourcing.md`). Needs an API key and its own design pass. Episode 001 uses a real exam.
- Remotion cards for the pipeline (timer, pass line, score, tally). They read `work/episode.json`; they live in `claude-youtube-editor/remotion/src/shots/rda-NNN/`.
