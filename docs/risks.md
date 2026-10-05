# Risk register

Each risk has a mitigation and a place where the mitigation is enforced. Review this after every
episode and update it with what actually happened.

| # | Risk | Likelihood and impact | Mitigation | Enforced in |
|---|---|---|---|---|
| 1 | **Exam accuracy.** A generated exam has a wrong key, unrealistic difficulty, or hallucinated facts | Likely for generated exams. High impact: the score and the debrief both become wrong | Blueprint-driven generation, mandatory citations, blind multi-run verification, human spot-check, frozen hash | [exam-sourcing.md](exam-sourcing.md) |
| 2 | **Format fatigue and pacing.** The jump from a comedic opening to a detailed breakdown loses non-specialist viewers | Likely. High impact on retention | Strongest material first in B4, one idea per 30 to 45 seconds, visual change every beat, running tally of what the exam tested | [format.md](format.md) B4 |
| 3 | **Production logistics.** Physical reward and punishment b-roll adds an external dependency | Certain. Low to medium impact | Plan the location and the prop before the study day. One short payoff session after the result. Never film the outcome in advance | [production.md](production.md) |
| 4 | **Exam rights.** A real exam may be copyrighted or restricted | Possible. High impact (takedown, trust) | Check terms before use. Show only the questions the debrief needs. Fall back to a blueprint-matched generated exam | [exam-sourcing.md](exam-sourcing.md) |
| 5 | **Credibility.** A first-timer's debrief is mistaken for professional guidance, especially in health or safety domains | Possible. High impact | Viewer contract rule 6, on-screen disclaimer in B4, no claims of qualification in titles or thumbnails | [format.md](format.md) |
| 6 | **Staged-looking stakes.** Viewers suspect the clock, the score, or the payoff is fake | Possible. High impact on the series' core promise | Visible timer from recording timestamps, score shown from the scorer, pass line stated before the test, frozen exam hash | [format.md](format.md) viewer contract |
| 7 | **Outcome variance.** Too many passes or too many fails makes the format predictable | Possible. Medium impact | Calibrate difficulty so both outcomes are live. Track pass and fail across episodes in `result.json` | [exam-sourcing.md](exam-sourcing.md) step 5 |
| 8 | **Sponsor disclosure.** An undisclosed sponsor read | Avoidable. High impact | Say it aloud in B5 and set YouTube's paid promotion option on upload | [format.md](format.md) B5 |
| 9 | **Domain choice.** Picking a domain with no usable real exam, no visual story, or no safe stakes | Likely early on. Medium impact | Score candidates against the rubric before committing | [backlog.md](backlog.md) |
| 10 | **Drift between repos.** The script or tracker row differs between `_RDA` and the pipeline | Possible. Low to medium impact | One owner per artifact and a defined handoff | [production.md](production.md) |

## After each episode

Add a short entry here for anything that went wrong or nearly did, and update the matching row. A risk
that never fires after several episodes can be demoted. A risk that fires twice gets a harder rule.
