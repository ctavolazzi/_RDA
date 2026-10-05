# Exam sourcing and generation

The exam is the spine of the episode. If the questions are wrong or the key is wrong, the score means
nothing and the debrief teaches the wrong thing. This doc covers where exams come from and how a
generated exam earns the right to be used.

## Order of preference

1. **A real exam from the source.** A released past paper, an official practice exam, or a published
   sample form from the body that runs the test.
2. **A real exam, adapted.** Same as above but trimmed to fit the time box (fewer items, same blueprint
   weights).
3. **An AI-generated exam, verified.** Used only when no suitable real exam is available. Must pass the
   verification protocol below before it is frozen.

Always say on screen which of the three was used.

## Real exams: checks before use

- **Rights.** Confirm the exam is publicly released or that its terms allow this use. Many licensing
  bodies copyright their items. If unsure, do not show full questions on screen, show only the ones
  needed for the debrief, or generate a blueprint-matched exam instead. This is a check to make, not
  legal advice.
- **Currency.** Note the year and whether the content has changed since (standards, codes, guidelines).
  The 2019 nursing paper in the concept is an example of a year that needs this check.
- **Key availability.** A real exam needs an official or well-sourced answer key. If the key is not
  published, the exam is not usable as a pass/fail test.
- **Scorability.** The host must be able to take it and be scored without the host seeing the key. A
  portal, or a scoring script that holds the key, both work.

## AI-generated exams: the protocol

The known failure modes are unrealistic difficulty, subtle factual errors, and a hallucinated answer
key. The protocol attacks each one.

### 1. Start from a blueprint, not a topic

Pull the official content outline for the exam (topic areas and their weights) and write it into the
episode's exam card. Generate items per topic area so the weights match. A generator told only "make a
nursing exam" will cluster on easy, famous facts.

### 2. Generate structured items

Each item is a JSON object matching [`schemas/exam.schema.json`](../schemas/exam.schema.json):

- the stem, four options, and the correct option
- a one-paragraph rationale for why that option is right and the others are wrong
- a **source citation** pointing at a primary reference the rationale relies on
- a topic area tag and a difficulty tag (easy, medium, hard)

For a generated exam, `rda exam freeze` rejects items without a citation. The citation is what makes a human spot-check
possible.

### 3. Verify the key blind

A separate pass answers every question **without seeing the key or the rationale**. Run it at least
three times, with fresh context each time. Any item where a verifier run disagrees with the key is
quarantined for human review. Items where every run agrees with the key move on.

Use a different prompt, and where possible a different model, from the one that generated the items.
Agreement between two copies of the same generator is weak evidence.

### 4. Spot-check against a primary source

A human checks a sample of items against the cited primary reference: all quarantined items, plus a
random 15 to 20 percent of the rest, plus every item tagged hard. Any item that fails is removed or
rewritten and re-verified. If more than a small fraction of the sample fails, discard the batch and
regenerate with a tighter prompt.

### 5. Calibrate difficulty

Compare the difficulty mix against the real exam's published pass rate or sample items. Aim for a
distribution where an informed beginner with a focused study window has a real chance of passing and a
real chance of failing. A pass line that is trivially cleared or impossible kills the stakes.

### 6. Freeze

Once verified, write the final `exam.json` and run `python tools/rda.py exam freeze`. It validates
the file, writes its SHA-256 into the exam card and `result.json`, splits the key into `key.json`,
and writes `questions.md`. Commit `exam/` before the study window opens. From this point the file
does not change; `rda exam check` proves it. This is what backs viewer contract rule 3.

### 7. Keep the key sealed

The host takes the test from `exam/questions.md`, which has no answers, and never opens `exam.json`
or `key.json`. `rda score` scores the answers against the key, so the host sees only their own
answers and the final score. This is an honor system backed by the committed hash; say so on camera.

Real exams need only the stem, options, and official answer per item. Rationales and citations are
required for generated exams only, because they are what gets verified.

## Output of this stage

For every episode: a frozen `exam.json`, its hash, the filled exam card, and a short verification log
(how many items, how many quarantined, how many corrected, how many sampled). The log is
`episodes/NNN-<slug>/exam/verification-log.md`.
