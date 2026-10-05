"""Render-side cut verification — cross-check a rendered preview/master against the
intended cut, using a second ASR pass. The raw-side QA (analyze_cut.py) works from the
raw transcript and audio; this tool checks what actually ENDED UP in the render.

Born from ch-3 (2026-07-10): an untranscribed 'and it—' false start survived into the
render. No raw-side energy heuristic can tell a ghost syllable from a word release
(both peak +20..+32 dB over the noise floor) — but a second ASR pass over the render
surfaces it as an EXTRA word / an odd intra-phrase gap. This tool automates that.

Usage:
  1. render:      python tools/render_cuts.py <project> --style <s> --mode preview
  2. extract+asr: ffmpeg -i output/preview-<s>.mp4 -vn -ac 1 -ar 16000 work/audio/preview.wav
                  python tools/transcribe.py <project> --clips preview --force
  3. verify:      python tools/verify_cut.py <project> [--rendered preview]

Checks (all advisory — they say WHERE to listen, the user's ear decides):
  1. word diff     — rendered ASR tokens vs the intended kept tokens (from the raw
                     transcript inside active keeps). INSERTED words = ghost speech
                     that rode along; MISSING words = clipped/dropped content;
                     REPLACED words = possible mangled audio at a join.
  2. interior gaps — pauses >= 0.40s BETWEEN tokens of the same keep in the render
                     (compressed internal pauses land ~0.35s; bigger = a hidden
                     hesitation or ghost the ASR skipped).
  3. low confidence— rendered tokens < 0.70 (unclear audio in the deliverable).
  4. A/V drift     — (with --style) rendered AUDIO time of each keep's first word vs
                     the PLANNED video time from plan_clip. Video frame rounding may
                     add up to ~20ms per segment; anything beyond that budget means
                     audio and video are drifting apart (the ch-3 concat bug: per-
                     segment AAC rounding accumulated ~1s of lip-sync error).

Writes work/analysis/verify-report.md and prints the summary.
"""

import argparse
import json
import re
from difflib import SequenceMatcher
from pathlib import Path

from cutlib import AudioProbe, active_keeps, load_words, plan_clip


def norm(token: str) -> list[str]:
    """Normalize an ASR token to comparable spoken words. ASR formatting differs
    between runs ('/env,' vs '.env,' vs 'slash dot env'), so expand path glyphs to
    their spoken form and strip punctuation/case. Only a '.' or '/' that PRECEDES a
    word is spoken ('.env' -> 'dot env'); trailing sentence punctuation is not."""
    t = token.lower().strip()
    t = re.sub(r"/(?=[a-z0-9])", " slash ", t)
    t = re.sub(r"\.(?=[a-z0-9])", " dot ", t)
    t = re.sub(r"[^a-z0-9' ]+", " ", t)
    return [w for w in t.split() if w]


def flatten(words: list[dict]) -> tuple[list[str], list[int]]:
    """Token list -> (normalized word list, index back to the source token)."""
    out, idx = [], []
    for i, w in enumerate(words):
        for piece in norm(w["text"]):
            out.append(piece)
            idx.append(i)
    return out, idx


def clock(t: float) -> str:
    return f"{int(t) // 60:02d}:{int(t) % 60:02d}"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--rendered", default="preview", help="transcript id of the rendered file")
    ap.add_argument("--style", help="style used for the render — enables the A/V drift check")
    args = ap.parse_args()

    project = Path(__file__).resolve().parent.parent / args.project
    data = json.loads((project / "work" / "analysis" / "cuts.json").read_text(encoding="utf-8"))

    # intended tokens = raw-transcript words inside active keeps, in clip order
    intended, keep_of = [], []  # keep_of[i] = (clip id, keep index) for interior-gap mapping
    for c in data["clips"]:
        words = load_words(project, c["id"])
        for ki, k in enumerate(active_keeps(c)):
            for w in words:
                if k["s"] - 0.02 <= w["start"] / 1000 and w["end"] / 1000 <= k["e"] + 0.02:
                    intended.append(w)
                    keep_of.append((c["id"], ki))

    rendered = json.loads((project / "work" / "transcripts" / f"{args.rendered}.json")
                          .read_text(encoding="utf-8"))["words"]

    a_words, a_idx = flatten(intended)
    b_words, b_idx = flatten(rendered)

    L = [f"# Verify report — {data['project']} (rendered: {args.rendered})", ""]
    inserted, missing, replaced = [], [], []
    matched_render = [False] * len(rendered)
    render_keep = [None] * len(rendered)  # which keep each matched rendered token came from

    for tag, i1, i2, j1, j2 in SequenceMatcher(None, a_words, b_words, autojunk=False).get_opcodes():
        if tag == "equal":
            for k, j in enumerate(range(j1, j2)):
                matched_render[b_idx[j]] = True
                render_keep[b_idx[j]] = keep_of[a_idx[i1 + k]]
            continue
        if tag in ("insert", "replace"):
            for j in range(j1, j2):
                w = rendered[b_idx[j]]
                entry = (w["start"] / 1000, b_words[j], w["text"])
                (replaced if tag == "replace" else inserted).append(entry)
                matched_render[b_idx[j]] = tag == "replace"
        if tag in ("delete", "replace"):
            for i in range(i1, i2):
                w = intended[a_idx[i]]
                missing.append((w["start"] / 1000, a_words[i], w["text"]))

    if inserted:
        L.append(f"- **{len(inserted)} EXTRA words in the render** (ghost speech that rode along — listen and cut):")
        for t, nw, raw in inserted:
            L.append(f"  - {clock(t)} ({t:.2f}s) · \"{raw}\" (heard as '{nw}')")
    if missing:
        L.append(f"- **{len(missing)} intended words MISSING from the render** (clipped or dropped):")
        for t, nw, raw in missing:
            L.append(f"  - raw {clock(t)} ({t:.2f}s) · \"{raw}\" (expected '{nw}')")
    if replaced:
        L.append(f"- **{len(replaced)} words heard DIFFERENTLY in the render** (possible mangled join — or just ASR variance; listen):")
        for t, nw, raw in replaced:
            L.append(f"  - {clock(t)} ({t:.2f}s) · render heard \"{raw}\"")

    # interior gaps: big pauses between consecutive rendered tokens of the SAME keep
    # (a join between keeps is expected to pause; inside a keep's phrase it is not)
    gaps = []
    for x, y in zip(range(len(rendered) - 1), range(1, len(rendered))):
        g = (rendered[y]["start"] - rendered[x]["end"]) / 1000
        if (g >= 0.40 and matched_render[x] and matched_render[y]
                and render_keep[x] is not None and render_keep[x] == render_keep[y]):
            gaps.append((rendered[x]["end"] / 1000, g, rendered[x]["text"], rendered[y]["text"]))
    if gaps:
        L.append(f"- **{len(gaps)} big interior pauses** (>= 0.40s between rendered words — hesitation or skipped ghost; joins land ~0.33s):")
        for t, g, x, y in gaps:
            L.append(f"  - {clock(t)} ({t:.2f}s) · {g:.2f}s · …{x} ⟂ {y}…")

    # A/V drift: audio time of each keep's first matched rendered word vs the plan's
    # video time for that word. Budget = per-segment video frame rounding (~20ms/seg).
    drift_rows, drift_flags = [], 0
    if args.style:
        style = data["styles"][args.style]
        probe = AudioProbe(project)
        seg_plan = []  # (clip_id, raw_start, raw_end, cum_video_start, seg_index)
        cum = 0.0
        for c in data["clips"]:
            words = load_words(project, c["id"])
            for si, (s, e) in enumerate(plan_clip(c["id"], active_keeps(c), words, style, probe,
                                                   c.get("cuts"))):
                seg_plan.append((c["id"], s, e, cum, len(seg_plan)))
                cum += e - s

        # MUST match on clip too: raw times restart at 0 in every clip, so a bare time
        # lookup returns the first coincidentally-overlapping segment (nearly always from
        # clip #1) and reports nonsense offsets on any multi-clip project.
        def plan_video_time(clip_id: str, raw_t: float):
            for cid_, s, e, cv, si in seg_plan:
                if cid_ == clip_id and s - 0.05 <= raw_t <= e + 0.05:
                    return cv + (raw_t - s), si
            return None, None

        seen_keeps = set()
        for j, w in enumerate(rendered):
            k = render_keep[j]
            if k is None or k in seen_keeps:
                continue
            seen_keeps.add(k)
            raw_w = None
            for i, kk in enumerate(keep_of):
                if kk == k:
                    raw_w = intended[i]
                    break
            if raw_w is None:
                continue
            vt, si = plan_video_time(k[0], raw_w["start"] / 1000)
            if vt is None:
                continue
            at = w["start"] / 1000
            budget = (si + 1) * 0.020 + 0.08
            over = abs(at - vt) > budget
            if over:
                drift_flags += 1
            drift_rows.append((at, at - vt, budget, w["text"], over))
        if drift_flags:
            L.append(f"- **A/V DRIFT — {drift_flags} keep(s) beyond the rounding budget** "
                     f"(audio and video timelines are separating; check the renderer):")
        else:
            L.append(f"- A/V drift check: OK ({len(drift_rows)} keeps within the frame-rounding budget). Worst offsets:")
        for at, d, budget, txt, over in sorted(drift_rows, key=lambda r: -abs(r[1]))[: 6 if not drift_flags else 32]:
            mark = ' <<<' if over else ''
            L.append(f"  - {clock(at)} · audio-vs-plan {d:+.3f}s (budget ±{budget:.2f}s) · \"{txt}\"{mark}")

    lowconf = [(w["start"] / 1000, w["text"], w.get("confidence", 1.0))
               for w in rendered if w.get("confidence", 1.0) < 0.70]
    if lowconf:
        L.append(f"- **{len(lowconf)} low-confidence rendered tokens** (< 0.70 — unclear audio in the deliverable):")
        for t, txt, cf in lowconf:
            L.append(f"  - {clock(t)} ({t:.2f}s) · conf {cf:.2f} · \"{txt}\"")

    header = [f"Extra: {len(inserted)} · missing: {len(missing)} · heard differently: {len(replaced)} · "
              f"big interior pauses: {len(gaps)} · low-confidence: {len(lowconf)}"
              + (f" · A/V drift flags: {drift_flags}" if args.style else " · A/V drift: not checked (pass --style)"), ""]
    if not (inserted or missing or replaced or gaps or lowconf or drift_flags):
        L.append("Clean — the render matches the intended cut word-for-word, no anomalies.")

    out = project / "work" / "analysis" / "verify-report.md"
    out.write_text("\n".join(L[:2] + header + L[2:]), encoding="utf-8")
    print("\n".join(header))
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
