# Decisions

One entry per decision worth remembering. Each says what was decided, why, what else was considered,
and what would make us revisit it. Newest first. Reversed decisions stay, marked as such, because the
reason they were reversed is information too. The narrative is in `docs/history/`.

---

### D21 · Current-event videos: sourced numbers, drawn diagrams, and a graphics cut made first (2026-10-18)

**Decided:** a news video follows `docs/current-event-video.md`. Every on-screen number carries a `SourceTag` and
needs two outlets (or is marked as single-sourced in the script's claims table); when sources disagree, the video
shows both. Products and people we hold no image rights to are drawn as diagrams, to scale where size matters, and
labeled as diagrams. The first cut is built in the cloud from graphics, a scratch voice and library music; borrowed
footage, CT on camera and interviews go in marked slots and are added on CT's machine, never faked.
**Why:** CT asked for "an actually genuinely engaging video about a current event", then "Give it a shot". Every
footage host is denied in this container (measured), so the honest cut is graphics-first; and the story got better by
showing a disagreement (three shipment counts, two China shares) instead of picking one number.
**Considered:** AI-generated footage of the product (it would show a robot that is not the product; never); waiting
for footage access before building anything (the script, timing, overlays and sound do not depend on it); a single
"best" shipment number (each firm's method differs; picking one hides the story).
**Revisit when:** footage hosts are allowed here (then fetch with a rights log, `tools/fetch_footage.py`, still to be
built), or CT's first upload shows how the graphics-only cut performs against the full version.

### D20 · A free local narrator: Kokoro, through tools/narrate.py (2026-10-18)

**Decided:** when a video needs a voice and there is no ElevenLabs key (or CT asks for a free one), narrate it with
`./venv/bin/python tools/narrate.py videos/<p>`: Kokoro v1.0 (`kokoro-onnx`, CPU, voice `af_heart`), reading the `Voice:`
lines of the video's `script/script.md`. Each scene exports the frame its line starts on; `_vo.json` holds the measured
lengths; the composition refuses a line that runs past its scene. The bed dips under each line, effects go back to their
table levels, and the master is `master_audio.py` at its defaults (-16 LUFS), as D19 planned for a voiced video.
**Why:** CT: "I want a narrator por favor", then "a free one". Kokoro's weights and voices are Apache 2.0 (monetizable),
it needs no account or key, runs in this container in about a second per line, and gave byte-identical clips on a second
run with a fresh model download, so the clips need not be committed. Measured mix: voice 18.1 dB over the bed and 10.6 dB
over the effects while it speaks.
**Considered:** ElevenLabs via `tools/gen_vo.mjs` (needs a paid key); `hyperframes tts` (the same Kokoro, but through
another engine's CLI; D17 keeps Remotion, so the Python package is used directly); Piper (its voices download from
Hugging Face, blocked here); espeak-ng alone (free but robotic); CT's own voice (better, and his call; nothing here
blocks it: record per-scene clips with the same names and lengths go into `_vo.json` the same way).
**Revisit when:** CT records his own narration, adds an ElevenLabs key and wants a different voice, or a viewer reaction
says the synthetic voice hurts. Also open: the RDA explainer (D9) can now be narrated the same way.

### D19 · Effects-led mixes with no voice master statically to -19 LUFS (2026-10-18)

**Decided:** when a video has no voice and the effects should lead over quiet music, master it with
`python tools/master_audio.py <video> --static --lufs -19` (one fixed gain, a 16 kHz roll-off, a limiter 2 dB under the
-1.5 dBTP ceiling). Voiced and bed-led mixes keep the default -16 LUFS.
**Why:** CT asked for "sound and quiet background music". Effects are short and peaky, so a mix with quiet music has a
large peak-to-loudness ratio. Default `loudnorm` then falls back to dynamic mode on its own, lifting the music until the
effects were only a few dB above it (contrast 19.6 dB before mastering, 11.9 after). A static master to -16 needed
about 10 dB of limiting and rang to +6.5 dBTP in the AAC encode. At -19 the balance holds (13.3 dB contrast, music 5 dB
under mix 1) with -2.0 dBTP.
**Considered:** -16 static (crushes the effects); -16 dynamic (the music comes back up); -18 (contrast 12.6 dB, more
limiting); narration to carry the loudness (CT declined the question; his words named sound and music).
**Revisit when:** the video gets a voice (then -16 and the music under the voice), or YouTube playback shows -19 reads
too quiet next to other videos (then bring the bed up a little and master at -18). The first happened the same day for
this video (mix 3, D20): default `loudnorm` to -16 kept the voiced mix's balance, so the -19 static rule stays for
effects-led mixes with no voice only.

### D18 · Videos are made with the script-to-render skill; self-measured numbers use two renders (2026-10-18)

**Decided:** a video made here follows `_workbench/.claude/skills/script-to-render/` (brief, script, plan, design,
build, stills, render, measure, thumbnail, package, record, show), and each run adds a case file to the skill. When a
video shows numbers about itself, they are measured on a first render, written to a data file, and shown in a second
render that is checked frame by frame to differ only where the numbers are.
**Why:** CT asked for the workflow to be a skill that improves over time, then for a video that explains its own
making. The first run (`docs/script-to-render-video.md`) caught three layout defects in stills, a thumbnail fix, and an
on-screen claim the code did not yet honor.
**Considered:** typing measured numbers by hand after the fact (nothing would prove they belong to the file shown);
showing the explainer's old numbers instead (true, but not this video's).
**Revisit when:** a video's numbers depend on something a second render changes (render time is the only one so far,
and it is labeled as render 1's).

### D17 · Keep Remotion; HyperFrames stays an experiment (2026-10-18)

**Decided:** Remotion remains the engine for RDA shots and thumbnails. HyperFrames is not adopted.
**Why:** a measured bake-off (`experiments/hyperframes/`) showed HyperFrames can match an RDA shot almost
exactly (SSIM 0.994 over 360 frames, same loudness, similar render time, alpha `.mov` that `bake.py`
accepts). Same output means switching buys nothing and costs a port of the RDA kit, the explainer, and
three skills. Remotion's free license covers a company of up to 3 employees.
**Considered:** a full migration (HTML shots, Apache 2.0, no bundle step); running both engines per shot
(possible, since `bake.py` only reads files, but two kits drift).
**Revisit when:** the business making the videos passes 3 employees (Remotion would need a company license);
a keyless local voice is wanted for narration (`hyperframes tts`, Kokoro, untested); or HyperFrames reaches
1.0 with something Remotion lacks that an episode actually needs.

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
