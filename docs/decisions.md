# Decisions

One entry per decision worth remembering. Each says what was decided, why, what else was considered,
and what would make us revisit it. Newest first. Reversed decisions stay, marked as such, because the
reason they were reversed is information too. The narrative is in `docs/history/`.

---

**About the numbers:** D18 to D21 are claimed by open PR #4, and PR #4 and PR #6 both use D17. D22 and D23
skip ahead so nothing new collides. Renumber the duplicate D17 when those PRs merge.

### D23 · One channel; RDA is a format, not its own channel (2026-10-21)

**Decided:** everything goes on one channel, where the host lives. RDA stays a format under the thesis
(D17), with its own rules in this repo. This supersedes the call in the strategy brief on PR #5
(`docs/STRATEGY.md`, "Launch RDA on its own channel"). What survives from that brief: RDA titles and
thumbnails name the exam, because exam names are what people search.
**Source:** user, 2026-10-21, "yes to both, go", answering whether to keep one channel for everything with RDA
as a format rather than its own channel.
**Why:** "I can just live there" needs one place to live. A second channel splits one host's time and
audience before either exists.
**Revisit:** if RDA episodes measurably pull a different audience that does not watch anything else.

### D22 · The next few steps: the channel's voice and sign-off (2026-10-21)

**Decided:** the brand is the host's "philosophy of the next few steps", under the thesis (D17). The thesis is
where we are going; the next few steps are how we get there. Made visible in every video by one device:
1. **The close:** "My next few steps", up to three, specific, said out loud and shown on a card, each with
   a when ("this week", "before studying").
2. **The check-in:** the next video opens by checking them: done, not done, what changed. A missed step is
   said out loud and marked NOT DONE. Use the real result, never the hoped-for one.
3. **The rule that keeps it honest:** every video shows at least one step actually taken, with proof.
   Talk with no step is the failure mode.

The card is `StepsCard` in `remotion/src/lib/rda.tsx` (previews: `RdaNextSteps`, `RdaStepsCheckIn` in
`remotion/src/shots/rda-cards/`; stills in `docs/style/`).
**Source:** user, 2026-10-21: "why waste time beating around the bush when all we really need to do is talk
'philosophy of the next few steps' and that's the brand and I can just live there", then "yes to both, go".
The close, the check-in and the card design are Claude's proposal, accepted in that answer.
**Why:** it ends the planning loop (the topic of each video is whatever the next steps are), it is honest by
construction (named steps can be checked), and the check-in gives viewers a reason to come back.
**Revisit:** the device, if retention data shows the check-in loses people; not the idea.

### D17 · RDA is a format under the channel's thesis (2026-10-19)

**Decided:** the channel has one thesis, "What if you could build the world you want to live in?", and RDA
is one of its formats: learn a skill the future needs, fast, against a real exam, with real stakes. Pick
domains that serve the thesis (for example solar, food growing, repair, tools); a domain that does not
needs a stated reason. The formula and all rules in this repo still govern RDA episodes. The channel plan
lives in `ctavolazzi/thecoffeejesus`, `series/build-the-world/`.
**Source:** user, 2026-10-19: "go, fold everything in under the thesis." The domain examples are assumed.
**Why:** every project on the channel points at the same idea; one thesis makes them doors into one house.
**Revisit:** when picking episode 001's exam: check it against the thesis.

### D16 · Every video ships with a thumbnail (2026-10-05)

**Decided:** making a video includes making its thumbnail. `rda status` has a "thumbnail made" item and
will not say "finish and ship" until it finds `packaging/thumb-*` or an image in `packaging/thumbs/`.
**Why:** the user's rule. A thumbnail is half of whether a video gets watched; it should never be an
afterthought or forgotten.
**Revisit:** not the rule. The check's file patterns can widen if thumbnails start living elsewhere.

### D15 · The style bible is a living guide, not a lock (2026-10-05)

**Decided:** `docs/style-bible.md` (v0.1) guides every video and thumbnail. It changes with feedback from
the user and the audience; each change gets a row in its feedback log and a version bump.
**Why:** the user wants consistency across episodes without freezing a look nobody has tested yet.
**Revisit:** never as a whole; edit it as data comes in.

### D14 · Thumbnails can be built as code (2026-10-05)

**Decided:** thumbnail A for the explainer is a Remotion still (`RdaExplainerThumb.tsx`), following the
`/thumbnail` skill's rules. Face-free thumbnails are committed under `videos/<p>/packaging/` (outside
`thumbs/`, which is git-ignored because those images show the host's face).
**Why:** no Gemini key and no face kit in the session; a code thumbnail is exact, reproducible, and on-palette.
**Revisit when:** the face kit exists. A face usually lifts CTR; use `/thumbnail` for that bet.

### D13 · One shared RDA kit for every video (2026-10-05)

**Decided:** the look moved from the explainer's `_kit.tsx` to `remotion/src/lib/rda.tsx`, and the fonts to
`media/library/fonts/rda/` (catalogued in `media/library/catalog.json`).
**Why:** consistency across episodes needs one source of truth; a kit inside one video's folder invites copies.

### D12 · One repo is the home base (2026-10-05)

**Decided:** `_RDA` holds everything: the formula, episodes, the `rda` tool, and the full production
pipeline vendored from `claude-youtube-editor`. `rda handoff` targets this repo by default.
**Why:** the user wants to work from one place; the split made every episode cross a repo boundary.
**Considered:** keeping two repos with a handoff (D5, now reversed); a git submodule (adds friction for a
solo creator on Windows); a subtree merge (keeps upstream history but drags in other people's videos).
**Revisit if:** upstream `claude-youtube-editor` ships changes we want regularly. Then pull them by hand
using `docs/vendored.md`, or reconsider a subtree.

### D11 · Render one shot folder at a time (2026-10-05)

**Decided:** `remotion/scripts/render-one.mjs` regenerates the registry for one group (`--group=`),
renders, then restores the full registry.
**Why:** a bundle includes every registered shot, and the example shots load Google Fonts over the
network, which fails behind the cloud proxy. Bundling one folder is also faster.
**Considered:** trusting the proxy CA in Chrome's NSS store (environment-specific, touches trust
settings); deleting the example shots (they are the kit's documentation).
**Revisit if:** fonts.ts moves to local font files, which would make full bundles work anywhere.

### D10 · Master every export to -16 LUFS / -1.5 dBTP (2026-10-05)

**Decided:** `tools/master_audio.py` is the last step before upload: two-pass loudnorm plus a limiter,
video copied.
**Why:** the explainer's first export was -32 LUFS, and YouTube does not raise quiet videos.
**Considered:** fixing levels only in the composition (fragile across videos); loudnorm without a limiter
(overshot the peak ceiling, -0.8 dBTP).
**Revisit if:** the pipeline's own final-mix step (`tools/mix_music.py`) takes over loudness for
talking-head episodes.

### D9 · The explainer is text-led, no narration (2026-10-05)

**Decided:** every idea is on screen, sized and timed to be read, over a music bed with SFX.
**Why:** no ElevenLabs key in the session, and the user had not recorded a voiceover.
**Revisit when:** a voice is available. Narration would likely carry more; lower the bed when it lands.

### D8 · RDA shots carry a local series look (2026-10-05)

**Decided:** the exam-booklet look (paper, form green `#1d6b58`, red pen for grading only, Bricolage
Grotesque, Source Sans 3, IBM Plex Mono) lives in the shared RDA kit (`remotion/src/lib/rda.tsx`, see D13) and `docs/style-bible.md`, not in
the brand contract.
**Why:** the brand contract belongs to `/brand-setup`, which interviews the user. Editing it by hand
makes the three brand files drift.
**Revisit:** when the user runs `/brand-setup`. Promote the look into `brand.md`, `brand.ts`, `fonts.ts`.

### D7 · Real exams need no rationale or citation per item (2026-10-05, reversed an earlier rule)

**Decided:** only `ai-generated` exams must carry `rationale` and `source_citation`. The tool and the
schema agree.
**Why:** an official key rarely has explanations; requiring them pushed toward inventing them, which
breaks the "nothing estimated" rule. For generated exams they are what gets verified.

### D6 · `freeze` writes a question-only sheet (2026-10-05)

**Decided:** `rda exam freeze` writes `exam/questions.md` (stems and options, no answers). The host
reads only that file and never opens `exam.json` or `key.json`.
**Why:** a dry run showed the host had no way to read the test without seeing the key.

### D5 · Two repos with a handoff (2026-10-05, REVERSED by D12)

**Was:** pre-production in `_RDA`, production in `claude-youtube-editor`, joined by `rda handoff <path>`.
**Why it made sense:** the pipeline was a separate, upstream-tracked project.
**Why reversed:** the user wants one home base. The path argument still works for a separate checkout.

### D4 · A stdlib-only CLI with a status command (2026-10-05)

**Decided:** `tools/rda.py`, no dependencies, runs on Windows and macOS. `status` reads the disk and
prints the next step instead of enforcing an order.
**Why:** the user's workflow is "happenstance": ideas arrive at random and work happens out of order.
**Considered and dropped:** `_pyrite`'s ticket CLI (too heavy for one person), a terminal test runner
(real exams come as PDFs or portals), generated timeline and upload plans (premature).
**Revisit if:** several episodes run at once, or a team joins.

### D3 · Tests are controls first (2026-10-05)

**Decided:** `tools/test_rda.py` plants bad input and asserts the tool refuses it, and every fix is
proven by planting the bug back and watching a test fail.
**Why:** borrowed from `_pyrite`'s operating prompt: a check you have never seen fail is not evidence.

### D2 · The exam freeze is the integrity mechanism (2026-10-05)

**Decided:** SHA-256 of `exam.json`, committed before studying, shown on camera with `rda exam check`.
**Why:** the format promises viewers the test is real. The key lives in the same repo, so this is an
honor system backed by a public commitment. Say so on camera.
**Revisit if:** the series grows and viewers ask for stronger proof (a third party holds the key, or a
hosted scorer).

### D1 · Real exams first; AI-generated only through the protocol (2026-10-05)

**Decided:** see `docs/exam-sourcing.md`. Episode 001 uses a real exam.
**Why:** the concept's own top risk is hallucinated answer keys. A real exam with an official key
removes it.
