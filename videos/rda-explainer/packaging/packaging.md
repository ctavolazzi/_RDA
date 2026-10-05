# Packaging: RDA explainer

Draft, 2026-10-05. Not uploaded. The video is a 60s explainer of the series and its kit, so it works
as a channel trailer or a series announcement. Built by hand (no Gemini key, no face kit in the session),
following the rules of `/thumbnail` and `/packaging`; run `/packaging` for the full three-bet treatment
once there is CTR data.

## Title

**Learning Any Field From Zero, Then Taking the Real Exam**

Alternates: "I'll Learn a New Field From Scratch Every Episode" · "One Field, One Study Window, One Real Exam".
Rule kept: the thumbnail word ("PASS") does not appear in the title; the two read as one sentence.

## Thumbnail A (rendered)

`thumb-A.jpg` (1280x720, 133 KB), source `remotion/src/shots/rda-explainer/RdaExplainerThumb.tsx`.

- **Hook:** one word, "PASS?", as a grading stamp in signal green with the question mark in flare.
- **Hero:** a filled answer sheet with two red-pen circles.
- **Hierarchy:** hook, then sheet. Nothing else. Bottom-right is clear for the timestamp.
- **Honesty:** the series is pass/fail, and no score is shown because this video has no real result.
- **Checked:** read at 1280 and at 320 wide (phone feed size); the hook still reads.

Re-render: `cd remotion && node scripts/render-one.mjs rda-explainer RdaExplainerThumb --still 0 --scale=1`,
then convert `out/stills/RdaExplainerThumb-f0.png` to JPG.

## Ideas for B and C (YouTube's Test and Compare takes three)

- **B, the clock:** a huge `6:00:00` countdown in signal green over the night ground, a small sealed
  answer sheet. Hook word: none, the number is the hook.
- **C, the face:** the host's real reaction next to the stamp. Needs the face kit in
  `media/library/faces/` and the `/thumbnail` skill with `GEMINI_API_KEY`. Faces usually win on CTR.

## Description (draft)

```
I'm starting a series: pick a field I know nothing about, study it inside a fixed window, take the
real exam, and live with the result. Pass, and there's a reward. Fail, and there's a punishment.
Then I break down what the exam actually tested.

This video shows how it works: the five-part format, how the exam is locked before I study so the
score is real, and the tool that runs every episode.

Episode 1 starts with picking the exam. Tell me which field you want to see.
```
