# Vendored: the claude-youtube-editor pipeline

The video production pipeline in this repo was copied in from
[ctavolazzi/claude-youtube-editor](https://github.com/ctavolazzi/claude-youtube-editor), the user's fork
of Hasan Aboul Hasan's open-source project, on **2026-10-05**, at commit **`c0049ca`** of branch
`claude/rda-challenge-series-eo8iyc` (upstream `main` plus the RDA explainer). It is MIT licensed; the
notice is in `LICENSES/claude-youtube-editor-MIT.txt` and must stay with the code.

## What came in

| Path | What |
|---|---|
| `tools/` (all but `rda.py`, `test_rda.py`, `master_audio.py`) | the Python and Node pipeline tools, the cut-editor UI, RNNoise models |
| `remotion/` | the Remotion project: config, scripts, `src/lib/` kit, `src/shots/{brand,example,rda-explainer}` |
| `media/library/` | SFX and music clips with catalogs, logos, workspace stills, the faces README |
| `media/projects/example/`, `media/projects/rda-explainer/` | media for the example shots and the RDA explainer |
| `.claude/skills/` | the nine pipeline skills |
| `brand.md`, `requirements.txt`, `.env.example`, `.gitattributes`, `.gitignore` rules, `videos/README.md` | contracts and config |

## What was left out, on purpose

Other people's video content and one-off files: `videos/video-1`, `video-2`, `video-3`, `short-blocks-30`
(Hasan's projects), their shots (`remotion/src/shots/video-1`, `video-2`, `short-ai-test`,
`short-blocks-30`) and media (`media/projects/video-1`, `video-2`, `short-ai-test`, `short-blocks-30`,
`voice-lab`), upstream `docs/` (`ai-clone-guide.md`, `shorts-factory-plan.md`), the upstream README and
CLAUDE.md (their rules are merged into this repo's `CLAUDE.md`), and two stray root files
(`Image 13.png`, `Recording.m4a`). About 50 MB stayed behind; about 19 MB came in.

Worth knowing if needed later: `shorts-factory-plan.md` upstream describes turning long-form into
Shorts (hook, one evidence carrier, named payoff, ask, end card), and `video-2/_shared/TermKit.tsx` has
a terminal-and-chips kit that could become the running "what the exam tested" tally.

## Local changes (keep this list current)

| File | Change | Why |
|---|---|---|
| `tools/yt_upload.py` | `ROOT = REPO` instead of `REPO.parent` | upstream resolved plan paths against the directory above the repo (a monorepo leftover) |
| `remotion/scripts/gen-registry.mjs` | added `--group=<folder>` | lets a render bundle one shot folder |
| `remotion/scripts/render-one.mjs` | new | render one composition; restores the full registry after |
| `remotion/package.json` | added the `render:one` script | convenience |
| `tools/master_audio.py` | new | loudness mastering before upload |
| `.gitignore` | upstream rules plus `.stems_tmp/` and the Python cache | one set of rules |

## Pulling upstream changes later

There is no automatic link. To take a specific upstream fix: diff the upstream file against ours,
port the change by hand, keep the local changes above, and add a line to this file. Do not copy
upstream wholesale over this tree; it would undo the changes above and bring back other people's videos.
