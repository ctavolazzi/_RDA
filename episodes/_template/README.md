# Episode template

Copy this folder to `episodes/NNN-<slug>/` (for example `episodes/001-nursing-entrance/`) and fill it in
top to bottom. Work in this order; each step unblocks the next.

1. **`exam/exam-card.md`**: name the exam, its source, its rules, the time limit, and the pass line.
2. **Exam stage**: follow [docs/exam-sourcing.md](../../docs/exam-sourcing.md). Save the frozen exam as
   `exam/exam.json` (validate it against [schemas/exam.schema.json](../../schemas/exam.schema.json)),
   write its SHA-256 into the exam card, fill `exam/verification-log.md`, and commit. Do this before the
   study window opens.
3. **`shotlist.md`**: plan the A-roll and b-roll, including the payoff props and location.
4. **Run the challenge**: study window, test, score. Fill in `result.json` immediately afterward.
5. **`debrief.md`**: outline the B4 synthesis from what the exam actually tested.
6. **`script/script.md`**: write the beats once the result and the debrief are known.
7. **Hand off** to the production pipeline per [docs/production.md](../../docs/production.md).

## Files

| File | Purpose |
|---|---|
| `exam/exam-card.md` | The one-page fact sheet for the exam |
| `exam/exam.json` | The frozen exam (not in the template; created in step 2) |
| `exam/verification-log.md` | What was checked on a generated exam and what was found |
| `shotlist.md` | A-roll and b-roll plan |
| `debrief.md` | Outline of B4a, B4b, B4c |
| `script/script.md` | Beat-by-beat script, in the format `tools/notion_sync.py` reads |
| `notion.json` | Tracker row properties for `tools/notion_sync.py` |
| `result.json` | The record of what happened: score, outcome, payoff, real durations |

## Notes on `notion.json`

The `stage` value must be one of the Stage options in the Notion tracker database. `Scripting` is a
safe starting value. `pillar` is omitted on purpose because the available options depend on the
tracker; add it once you know them. Replace every `TODO` before syncing.
