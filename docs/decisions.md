# Decisions

One entry per decision worth remembering. Each says what was decided, why, what else was considered,
and what would make us revisit it. Newest first. Reversed decisions stay, marked as such, because the
reason they were reversed is information too. The narrative is in `docs/history/`.

---

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
Grotesque, Source Sans 3, IBM Plex Mono) lives in `remotion/src/shots/rda-explainer/_kit.tsx`, not in
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
