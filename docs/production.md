# Production

## Assets per episode

| Type | What | Notes |
|---|---|---|
| A-roll | Talking head to camera | Recorded last, once the result is known, so the reactions and the debrief are honest |
| A-roll | Desktop capture of the study window and the test | Real recording. This is the proof that the clock and the score are real |
| B-roll | Handheld or phone clips for the stakes and the payoff | Coffee shop trip, prop reactions, the punishment item |
| Visuals | Debrief slides and diagrams for B4 | Built as Remotion shots over the cut, not as a static deck |
| Exam | Frozen `exam.json`, hash, verification log | See [exam-sourcing.md](exam-sourcing.md) |

## The production pipeline

The pipeline lives in this repo (vendored from claude-youtube-editor on 2026-10-05; see
[vendored.md](vendored.md)). Its order is: cut, visuals, voice, SFX, packaging, master, upload.

| Episode need | Pipeline step |
|---|---|
| Tighten the talking head, remove fillers | `/clean-cut` |
| B4 slides, diagrams, score card, timer overlays | `/make-tsx` |
| Test capture shown as proof | A real recording slot in `timeline.json`. The `/make-tsx` skill reserves real recordings for genuine proof, which is exactly this case |
| Noisy desktop or room audio | `/clean-audio` |
| Score sting, reward, punishment, transitions | `/suggest-sfx` |
| Thumbnail, required for every video | `/thumbnail`, or a Remotion still in the RDA look; saved to `videos/rda-NNN/packaging/` |
| Title, description, and more thumbnail bets | `/packaging` |
| Loudness to -16 LUFS / -1.5 dBTP before upload | `tools/master_audio.py` |
| Upload as a private draft | `tools/yt_upload.py` |
| Track the row in the content tracker | `tools/notion_sync.py` |

The pipeline's conventions apply to anything shown on screen. In particular, on-screen text avoids
em dashes, and raw footage and master cuts never go to git.

## Where each file lives

Everything is in this repo. Pre-production (the exam and the challenge) lives under `episodes/`;
production (footage-driven work) lives under `videos/` once the episode is handed off. Each artifact
has one location, so nothing drifts.

| Artifact | Owner | Location |
|---|---|---|
| Series docs, format, risk register, backlog | series | `docs/` |
| Episode template | series | `episodes/_template/` |
| Exam, hash, verification log, exam card, result record | pre-production | `episodes/NNN-slug/exam/` and `result.json` |
| Shot list and debrief outline | pre-production | `episodes/NNN-slug/` |
| Script (once the episode is in production) | production | `videos/rda-NNN/script/script.md` |
| `notion.json`, cuts, transcripts, timeline, SFX plan, packaging | production | `videos/rda-NNN/` |
| Shots and per-episode media | production | `remotion/src/shots/rda-NNN/`, `media/projects/rda-NNN/` |
| Raw footage, master cuts, rendered output | local only, git-ignored | never committed |

### The handoff

An episode moves from pre-production to production when the test has been taken and the result is recorded.

1. `python tools/rda.py exam check` passes and `python tools/rda.py status` shows the episode scored.
2. `python tools/rda.py handoff` creates `videos/rda-NNN/`, copies in `script/script.md` and
   `notion.json` (never overwriting), exports `work/episode.json` for the cards, and writes the path
   back into `result.json`. (A path argument still hands off to a separate pipeline checkout.)
3. From then on the script is edited in `videos/rda-NNN/` only. Re-run
   `python tools/notion_sync.py videos/rda-NNN --apply --resync` after script changes.

## Recording order

The format is told in the order B1 to B5, but it is not recorded in that order.

1. Freeze the exam. Commit it.
2. Record the stakes and the baseline (B1 and B2 as they are true at the start of the challenge).
3. Run the study window with the desktop capture and the timer on.
4. Take the test through the scorer. Capture the score screen.
5. Film the payoff b-roll for whichever outcome happened. Never film the outcome in advance.
6. Record the talking head for B3 to B5, now that the result and the content are known.

## Time budget guide

These are planning numbers to adjust after the first episode, not measurements.

| Stage | Plan |
|---|---|
| Exam sourcing or generation and verification | Before the study day. Do not compress it |
| Study window and test | The fixed constraint for the episode (example: 6 hours) |
| Payoff b-roll | One short session after the result |
| Talking head | One sitting |
| Pipeline (cut, visuals, SFX, packaging, master) | Per the skills in `.claude/skills/` |

Record the real durations in `result.json` after episode 001 and replace this table with measured
numbers.
