# Episode template

`python tools/rda.py new <slug>` copies this folder to `episodes/NNN-<slug>/` and fills in the
episode number. From then on `python tools/rda.py status` says what is next. The usual order:

1. **`exam/exam-card.md`**: name the exam, its source, its rules, the time limit, and the pass line.
2. **`exam/exam.json`**: the exam, following [docs/exam-sourcing.md](../../docs/exam-sourcing.md) and
   [schemas/exam.schema.json](../../schemas/exam.schema.json). Then `rda exam freeze`, which validates
   it, writes the SHA-256 into the card, and seals the key into `exam/key.json`. The sign-off in
   `exam/verification-log.md` is yours to fill. Commit `exam/` before the study window opens.
3. **`shotlist.md`**: plan the A-roll and b-roll, including the payoff props and location.
4. **Run the challenge**: `rda clock start`, study, test, `rda clock stop`, `rda score`. The tool fills
   `result.json`; you set `payoff.filmed` after the b-roll.
5. **`debrief.md`**: outline the B4 synthesis from what the exam actually tested.
6. **`script/script.md`**: write the beats once the result and the debrief are known.
7. **`rda handoff`** per [docs/production.md](../../docs/production.md): production then happens in `videos/rda-NNN/`.

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
