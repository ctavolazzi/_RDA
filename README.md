# RDA: Rapid Domain Acquisition Challenge Series

A repeatable video format for rapid learning, exam-taking, and domain synthesis.

The host is not an expert. Each episode shows authentic first-time exposure to a domain, a fixed
study window, a real pass/fail exam with stakes, and then a transparent technical debrief of what
the exam actually tested. Entertainment first, analysis second, and the two are clearly separated.

The goal is a low-overhead series that pairs dynamic storytelling with a genuine educational
takeaway, and that can be produced again and again with the same machinery.

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
python tools/rda.py handoff <pipeline path>     # scaffold videos/rda-NNN/ and export work/episode.json
python tools/rda.py log "<text>"                # dated receipt in the episode log
python tools/test_rda.py                        # the checks, with planted-bad-input controls
```

`status` reads what is on disk, so it works whatever order things happened in.

## Repo map

```
README.md                  this file
CLAUDE.md                  how we work here and the formula on one page
tools/rda.py               the tool; tools/test_rda.py its checks
docs/
  format.md                the five-phase arc, beat by beat, plus the viewer contract
  exam-sourcing.md         real exams first, AI-generated exams with a verified answer key second
  production.md            asset pipeline, who owns which file, how it flows into claude-youtube-editor
  risks.md                 risk register with a mitigation and an owner for each risk
  backlog.md               candidate domains and the rubric for picking the next one
schemas/
  exam.schema.json         the shape of a frozen exam file (real or generated)
episodes/
  _template/               copy this to start an episode (script, exam card, shot list, debrief, result)
```

## How an episode moves

```
pick domain  ->  source or generate exam  ->  freeze exam  ->  study window  ->  take test
     (backlog)        (exam-sourcing)          (hash + commit)     (timed)        (screen capture)
                                                                                        |
   upload  <-  packaging  <-  SFX  <-  visuals  <-  clean cut  <-  record talking head  <-+
```

Pre-production lives here in `_RDA`. Once the exam is taken and footage exists, `rda handoff` moves
the episode to the production pipeline in
[claude-youtube-editor](https://github.com/ctavolazzi/claude-youtube-editor) as `videos/rda-NNN/`.
The handoff rule is in [docs/production.md](docs/production.md).

## Status

No episode has been made yet. The first step is to pick episode 001 from
[docs/backlog.md](docs/backlog.md) and run `python tools/rda.py new <slug>`.

Not built yet: LLM exam generation with blind key verification (the protocol is in
[docs/exam-sourcing.md](docs/exam-sourcing.md)); episode 001 uses a real exam.
