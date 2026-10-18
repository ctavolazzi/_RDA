# RDA: Rapid Domain Acquisition: strategy brief

*A YouTube challenge series: learn a field from zero, sit a real exam on camera, live with the stakes.*

Strategy brief, October 18, 2026 · Stage: pre-launch · No channel or upload yet · Episode 001 proposed: FCC Technician exam

> **Positioning.** For curious adults weighing a real credential who want to know how hard it is and what it tests, RDA is the learning challenge show that sits a real exam on camera with a visible clock, a sealed test and real stakes, unlike exam-prep lectures (useful, dull) or stunt channels (fun, but they teach nothing).

**The call.** Launch RDA on its own channel, aimed at people weighing a real exam. Pick episodes by exam search demand, finish the exam tool’s checks before the first shoot, and earn from study-material affiliates and prep sponsors long before AdSense is reachable.

## Where it stands today

| Area | Today | Source |
|---|---|---|
| Episode tool | rda.py and its tests pass on main; status reports no episodes yet. | tools/rda.py, tools/test\_rda.py |
| Episode 001 | Proposed in PR #3: FCC Technician (Element 2), pass line 26 of 35, graded by the volunteer examiners. Stakes, study window and baseline still TODO. | episodes/001-ham-technician/exam/exam-card.md (PR #3) |
| Explainer | A 60-second explainer and its thumbnail exist as code, not uploaded. | remotion/src/shots/rda-explainer/, videos/rda-explainer/packaging/ |
| Pipeline | Video pipeline vendored (MIT); the style bible defines the look, but the brand files still hold the upstream indigo. | docs/vendored.md, docs/decisions.md D8 |

## Market

Learning-challenge edutainment on YouTube, bordering exam prep. The show earns on attention like any channel, but its strongest money sits next to the exam: study materials and prep providers.

- **$60B+**: YouTube revenue in 2025. Source: [Tubefilter (search result)](https://tubefilter.com/2026/02/05/alphabet-q4-2025-youtube-earnings-revenue-60-billion/)
- **73,914**: FAA Part 107 drone test takers in 2025, a candidate episode 002 audience. Source: [The Drone U (search result)](https://www.thedroneu.com/blog/part-107-test-mistakes/)
- **710,942**: Active US amateur radio licenses; 24,936 new ones in 2023. Source: [VoxBooster, ARRL 2023 report (search results)](https://voxbooster.com/blog/ham-radio-statistics-2026)

Exam-prep market size and exam keyword search volumes were not found; measure search demand in YouTube and Google keyword tools before choosing each episode.

## Audience segments

Four viewer segments, scored on fit with the format. Sponsors form a fifth, separate market: exam-prep vendors (fit 5, affiliate programs such as Pilot Institute pay 20%) and learning platforms like Brilliant (fit 4).

### The exam-curious (beachhead), fit 5 of 5

- **Who:** Adults weighing a specific test: ham radio, drone pilot, trade and IT certifications.
- **Size:** Part 107: 73,914 takers in 2025. Ham: 24,936 new licenses in 2023.
- **Job to be done:** Find out how hard the test is, what is on it, and how much study is enough.
- **Pains:** Prep courses are long; nobody says how much study it really takes.
- **Uses today:** Prep channels, HamStudy, practice exams.
- **Will pay:** Buys study materials; prep vendors pay affiliates up to 20%.
- **Reach them:** YouTube and Google search for the exam name, subreddits, clubs.

Search intent finds a new channel faster than browse, and affiliate money sits right beside the exam.

### Curious generalists, fit 4 of 5

- **Who:** Viewers of Mark Rober, Veritasium and Mike Boyd.
- **Size:** Rober 81.7M and Veritasium 20.7M subscribers (search results).
- **Job to be done:** Be entertained and learn something real.
- **Pains:** Stunts with no substance.
- **Uses today:** Big science and challenge channels.
- **Will pay:** Ad-supported viewing; sponsor integrations pay $20 to $50 per 1,000 views.
- **Reach them:** Browse feed and Shorts.

Right audience for the format, but the hardest feed for a new channel to break into.

### Domain insiders, fit 4 of 5

- **Who:** Existing hams, drone pilots, tradespeople watching a newcomer sit their test.
- **Size:** 710,942 active US ham licenses.
- **Job to be done:** See their field through a beginner’s eyes and share it.
- **Pains:** Few newcomer stories that are fair to the field.
- **Uses today:** Club videos, forums.
- **Will pay:** Low directly; high as sharers.
- **Reach them:** Clubs, forums, the exam’s subreddit.

They spread each episode, but the domain changes every time, so loyalty resets.

### Rapid learners, fit 3 of 5

- **Who:** Fans of learn-anything methods (Josh Kaufman’s 20-hour idea).
- **Size:** Kaufman’s TEDx talk: 22M+ views (search result).
- **Job to be done:** Get a learning method that transfers.
- **Pains:** Advice without proof.
- **Uses today:** Productivity channels and books.
- **Will pay:** Buys courses and books.
- **Reach them:** Search for learning methods.

Good for the debrief segment of each episode; a weaker hook on its own.

**Why this beachhead:** Episode 001 is already a ham exam, exam names are searched by people with a decision to make, and study materials give an affiliate income from the first upload.

## Competitive landscape

| Alternative | Price | Strength | Weakness | How we differ |
|---|---|---|---|---|
| Mike Boyd, Learn Quick | 2.94M subscribers | Learns a skill from zero on camera. | No exam or verdict; growth flat in the last 30 days (vidIQ). | Credential exams with a sealed test, an outside grader and a debrief. |
| Michelle Khare, Challenge Accepted | 5M+ subscribers, 825M+ views | Real tests with real pass or fail. | Weeks-long, expensive productions. | Cheap, repeatable knowledge exams one person can film. |
| Mark Rober, Veritasium, SmarterEveryDay | 81.7M, 20.7M, 11.9M subscribers | Production values and trust. | Not repeatable for a solo host. | Borrows the stakes, not the budget. |
| Exam-prep channels (Ham Radio Crash Course, Professor Messer) | About 170K (2020) and 700K+ subscribers | Rank for exam searches. | Lectures with no drama. | Feeds their funnel: a partner and sponsor, not a rival. |

## Value proposition and offer

- **For the exam-curious:** Watch a true beginner take your exam with a visible clock and a sealed test, then see what it tested and how much study was enough. Timestamps from the tool, a frozen exam with a published hash, and an outside grader for real exams.
- **For curious generalists:** Ten minutes: a real verdict, a real punishment, then the three most surprising things a field knows. Stakes are filmed as they happened, pass or fail.

### Pricing ladder

| Step | Tier | Price | What | Benchmark | Status |
|---|---|---|---|---|---|
| 1 | Affiliate links | 4.5% to 20% per sale | Study guides, radios, prep courses linked in every episode. | Amazon books 4.5%; Pilot Institute 20%. | Proposed |
| 2 | Sponsor reads | $20 to $50 per 1,000 views | One read per episode from a prep vendor or learning platform. | Industry calculators; one report cites a $26.50 median. | Proposed |
| 3 | First-timer cram sheet | $15 to $20 | What the exam actually tested, per episode. | Professor Messer sells notes at $20. | Proposed |
| 4 | AdSense and memberships | About $10 per 1,000 views | Unlocks at 1,000 subscribers and 4,000 watch hours; fan funding opens at 500. | Education median RPM $10.22 across 300 channels (AIR). | Proposed |

## Go to market

1. **YouTube search.** People type exam names when they are deciding; a new channel can rank there. **First move:** Title episode 001 for search, such as “I Took the Ham Radio Technician Exam After N Hours of Study”, and queue Part 107 next.
2. **Shorts.** Verdict moments are vertical-native and feed the long episode. **First move:** Cut the verdict and the payoff into three Shorts per episode.
3. **Domain communities.** Each exam has clubs and a subreddit that share fair newcomer stories. **First move:** Ask the volunteer examiner team for permission to film, then share with the club.

## Plan

### Next 90 days

| Date | Milestone | Target |
|---|---|---|
| 2026-10-26 | Exam tool checks complete; PR #3 merged | Tamper tests pass; one channel chosen |
| 2026-11-08 | Channel live with a trailer | The explainer uploaded with its thumbnail |
| 2026-11-29 | Episode 001 live | 1 episode, 3 Shorts, affiliate links in the description |
| 2026-12-27 | Episode 002 live | Part 107 or a 20-question mini test |
| 2027-01-31 | Cadence proven | 4 episodes, 12 Shorts, 250 subscribers |

### 12-month goals

- 12 episodes published by October 31, 2027, each with a thumbnail checked at 320 px.
- 1,000 subscribers, a stretch: the median channel takes about 16 months.
- $1,000 from affiliates and sponsors combined.

## KPIs

| Metric | How to measure | Target |
|---|---|---|
| Search share | Percent of views from YouTube search (Studio, traffic sources). | Set after episode 001 |
| Thumbnail click-through | Studio impressions CTR, plus Test and Compare between thumbnails. | Set after episode 001 |
| Retention at 2:00 | Studio retention graph at the start of the study segment. | Set after episode 001 |
| Subscribers per 1,000 views | Studio subscribers gained divided by views. | Set after episode 001 |
| Revenue per 1,000 views | Affiliate, sponsor and ad income combined, divided by views. | Set after episode 002 |

## Risks

| Risk | Level | Mitigation |
|---|---|---|
| Exam content rights | Medium | Never film a live test. Show only public pools (the Technician pool is public domain per NCVEC) or official samples. |
| Viewers leave during the study segment | Medium | Follow the pacing rules in docs/format.md and track retention at 2:00. |
| Owner time | High | A fixed monthly slot and an hour cap per episode; episode 001’s stakes are still open. |
| Monetization thresholds rise | Low | Earn from affiliates and sponsors first; reports say new YouTube Partner applicants may need more watch hours from February 2027. |

## Untangling

RDA has no channel yet, which makes this the cheapest moment to separate it. Today its status, topics and tooling lean on other businesses.

### What ties it to other projects today

- No channel chosen; the owner already runs channels for his personal brand and two other projects.
- RDA status is tracked inside another company’s checkpoint file, and PR #3 sits on a branch named for that company.
- Episode topics are justified by another business’s needs, such as drone mapping for farms.
- Other projects use RDA’s thumbnail and video pipeline, and PR #4 adds a non-RDA video in the RDA look.
- One host for every project.

### Steps to stand alone

1. Open an RDA-only channel, Google account and tracker.
2. Track RDA only in the \_RDA repo, on RDA-named branches.
3. Move the shared video pipeline to its own tools repo, and move PR #4 out of \_RDA.
4. Apply the RDA tokens as the brand, and keep the RDA look for RDA videos only.
5. Choose topics with the rubric in docs/backlog.md, not by another business’s needs. When a credential also pays (an FAA Part 107 certificate makes paid drone work legal), say so on camera as part of the stakes.
6. Cross-promote once, with one disclosed launch post.

## Decisions for the owner

1. A new channel, or the existing personal channel? (Proposed: a new channel, seeded once.)
2. Episode 001’s stakes, study window, baseline and exam session date.
3. A face in thumbnails or not (style bible section 10)?
4. Upload cadence and an hour cap per episode.
5. Does PR #4 belong in RDA?

## Sources

1. [Tubefilter: Alphabet Q4 2025](https://tubefilter.com/2026/02/05/alphabet-q4-2025-youtube-earnings-revenue-60-billion/): YouTube revenue over $60B in 2025
2. [Goldman Sachs: the creator economy](https://www.goldmansachs.com/insights/articles/the-creator-economy-could-approach-half-a-trillion-dollars-by-2027): Creator economy near $480B by 2027
3. [The Drone U: Part 107 test](https://www.thedroneu.com/blog/part-107-test-mistakes/): 73,914 Part 107 takers in 2025
4. [ARRL 2023 annual report](https://www.arrl.org/files/file/About%20ARRL/Annual%20Reports/2023%20ARRL%20Annual%20Report.pdf): 24,936 new ham licenses in 2023
5. [VoxBooster: ham radio statistics](https://voxbooster.com/blog/ham-radio-statistics-2026): 710,942 active US ham licenses
6. [NCVEC: 2026 to 2030 Technician pool](https://ncvec.org/index.php/2026-2030-technician-question-pool): 409-question public-domain pool
7. [vidIQ: Mike Boyd](https://vidiq.com/youtube-stats/channel/@mikeboyd/): Subscribers and recent growth
8. [Michelle Khare: about](https://michellekhare.com/about): Subscribers and views
9. [vidIQ: SmarterEveryDay](https://vidiq.com/youtube-stats/channel/@smartereveryday/): Subscriber count
10. [Pilot Institute affiliates](https://pilotinstitute.com/affiliates/): 20% affiliate commission
11. [Amazon affiliate rates](https://affiliatexblocks.com/amazon-affiliate-commission-rates/): 4.5% on physical books
12. [CollabPals sponsorship calculator](https://www.collabpals.com/tools/youtube-sponsorship-rate-calculator): $20 to $50 per 1,000 views
13. [AIR: YouTube RPM from 300 channels](https://air.io/en/air-data-findings/how-much-does-youtube-really-pay-in-2026-real-rpm-data-from-300-channels): Education median RPM $10.22
14. [Overseeros: time to 1,000 subscribers](https://www.overseeros.com/blog/how-long-to-get-1000-subscribers-on-youtube): About 16 months median
15. [Relevant Audience: YPP thresholds](https://www.relevantaudience.com/youtube/youtube-partner-program-thresholds-double-february-2027/): Reported threshold change in 2027 (unverified)

---

*Prepared October 18, 2026 from the \_RDA repo and web research. Page fetches were blocked during research, so every web figure comes from search results; verify a figure before quoting it. Plans, prices and positioning are recommendations, marked Proposed where they appear. This is the public edition: internal operational detail is kept in a private copy.*
