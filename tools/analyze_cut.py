"""QA review loop — re-scans the generated cut and reports issues for the audit.

Usage: python tools/analyze_cut.py video-1 [--style tight]
Reads:  cuts.json, transcripts, audio
Writes: work/analysis/qa-report.md  (+ prints summary)

Checks:
  1. internal dead-air  — pauses >= internal_gap sitting inside kept speech
  2. clipped tails      — cut points where the word's release can't decay to the
                          noise floor within max_tail (needs a softer landing)
  3. tiny fragments     — one/two-word keeps that may be leftover stumbles
  4. fluff suggestions  — semantic removable content flagged for review (suggest-only)
  5. hard entries       — a planned segment that begins at a real cut join starts
                          while audio is still hot: the cut slices into ongoing sound
                          (clipped word onset, or the ASR token started late — verify
                          the token's start time against the audio)
  6. low-confidence     — kept tokens with ASR confidence < 0.70: either unclear audio
                          or a recognizer struggle (both mean: listen to this spot)

Checks 5-6 exist because of ch-3 (2026-07-10): a mistimed '/env' token made the cut
clip a word onset ('slash dot env' → '...env'). The companion RENDER-side check is
tools/verify_cut.py — an untranscribed 'and it—' false start survived into that same
render, and energy heuristics cannot tell a ghost syllable from a word release
(measured: both peak +20..+32 dB over floor). Only a second ASR pass over the rendered
preview separates them. Run verify_cut.py after every preview render.
"""

import argparse
import json
from pathlib import Path

from cutlib import AudioProbe, active_keeps, internal_pauses, load_words, plan_clip, split_atoms, tail_for


def clock(t: float) -> str:
    return f"{int(t) // 60:02d}:{int(t) % 60:02d}"


def entry_check(probe: AudioProbe, cid: str, segs: list, floor: float) -> list:
    """Hard entries: RMS just before a segment start is >15 dB over floor — the cut
    slices into ongoing sound (clipped onset or a late ASR token; a breath intake sits
    ~+12 dB, real speech +20 and up). Only meaningful at REAL cut joins (raw gap to the
    previous segment > 0.75s); at compressed intra-keep pauses the preceding audio is
    legitimately the same phrase."""
    entries = []
    prev_end = None
    for s, e in segs:
        real_join = prev_end is None or (s - prev_end) > 0.75
        if real_join:
            over = probe.rms_db(cid, max(s - 0.06, 0.0), 0.05) - floor
            if over > 15:
                entries.append((s, round(over, 1)))
        prev_end = e
    return entries


def low_confidence(keeps: list, words: list, thr: float = 0.70) -> list:
    out = []
    for k in keeps:
        for w in words:
            s, e = w["start"] / 1000, w["end"] / 1000
            if k["s"] - 0.02 <= s and e <= k["e"] + 0.02 and w.get("confidence", 1.0) < thr:
                out.append((s, w["text"], w.get("confidence", 1.0)))
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--style", default="tight")
    args = ap.parse_args()

    project = Path(__file__).resolve().parent.parent / args.project
    data = json.loads((project / "work" / "analysis" / "cuts.json").read_text(encoding="utf-8"))
    style = data["styles"][args.style]
    probe = AudioProbe(project)

    L = [f"# QA report — {data['project']} ({args.style})", ""]
    tot_deadair = tot_clip = tot_frag = tot_fluff = tot_entry = tot_lowconf = 0
    est = 0.0

    for c in data["clips"]:
        cid = c["id"]
        words = load_words(project, cid)
        keeps = active_keeps(c)
        segs = plan_clip(cid, keeps, words, style, probe, c.get("cuts"))
        est += sum(e - s for s, e in segs)

        pauses = internal_pauses(keeps, words, style["internal_gap"])
        floor = probe.floor_db(cid)
        entries = entry_check(probe, cid, segs, floor)
        lowconf = low_confidence(keeps, words)
        atoms = split_atoms(keeps, words, style["internal_gap"])
        clips_ = []
        for i, (_, e) in enumerate(atoms):
            gap = atoms[i + 1][0] - e if i + 1 < len(atoms) else None
            tail, _ = tail_for(probe, cid, e, gap, style)
            over = probe.rms_db(cid, e + tail) - floor
            if over > 6:  # word release still audible where we land
                clips_.append((e, round(over, 1)))
        frags = [k for k in keeps if len(k["text"].split()) <= 2]
        fluff = c.get("fluff_suggestions", [])

        if pauses or clips_ or frags or fluff or entries or lowconf:
            L.append(f"## clip {cid}")
        if entries:
            L.append(f"- **{len(entries)} HARD ENTRIES** (a cut join starts while audio is hot — "
                     f"clipped onset or late ASR token; check the token start against the audio):")
            for s, over in entries:
                L.append(f"  - {clock(s)} (raw {s:.2f}s) · +{over} dB over floor just before the cut-in")
        if lowconf:
            L.append(f"- **{len(lowconf)} low-confidence kept tokens** (<0.70 — unclear audio or "
                     f"ASR struggle; listen to these spots):")
            for s, txt, conf in lowconf:
                L.append(f"  - {clock(s)} (raw {s:.2f}s) · conf {conf:.2f} · \"{txt}\"")
        if pauses:
            L.append(f"- **{len(pauses)} internal pauses** >= {style['internal_gap']}s "
                     f"(compressed by renderer; listed for awareness):")
            for p in pauses:
                L.append(f"  - {clock(p['at'])} · {p['gap']}s · …{p['before']} ⟂ {p['after']}…")
        if clips_:
            L.append(f"- **{len(clips_)} clipped-tail risks** (word release > {style['max_tail']}s, "
                     f"landing still {clips_[0][1]}+ dB over floor — soft landing applied, verify):")
            for e, over in clips_:
                L.append(f"  - {clock(e)} · +{over} dB over floor at max tail")
        if frags:
            L.append(f"- **{len(frags)} very short keeps** (verify not leftover stumbles):")
            for k in frags:
                L.append(f"  - {clock(k['s'])} · \"{k['text']}\"")
        if fluff:
            applied = [x for x in fluff if x.get("status") == "auto_applied"]
            sugg = [x for x in fluff if x.get("status") != "auto_applied"]
            if applied:
                L.append(f"- **{len(applied)} fluff AUTO-REMOVED** (high confidence — say 'undo' to restore):")
                for x in applied:
                    L.append(f"  - ❌ {clock(x['s'])}–{clock(x['e'])} · \"{x['text'][:70]}\" — {x.get('note','')}")
            if sugg:
                L.append(f"- **{len(sugg)} fluff suggestions** (SUGGEST-ONLY, you decide):")
                for x in sugg:
                    L.append(f"  - 💡 {clock(x['s'])}–{clock(x['e'])} · \"{x['text'][:70]}\" — {x.get('note','')}")
        tot_deadair += len(pauses); tot_clip += len(clips_); tot_frag += len(frags); tot_fluff += len(fluff)
        tot_entry += len(entries); tot_lowconf += len(lowconf)

    header = [f"Estimated **{args.style}** length: **{clock(est)}** ({est:.0f}s)",
              f"Internal pauses: {tot_deadair} · clipped-tail risks: {tot_clip} · "
              f"short keeps: {tot_frag} · fluff suggestions: {tot_fluff}",
              f"Hard entries: {tot_entry} · low-confidence kept tokens: {tot_lowconf}", ""]
    out = project / "work" / "analysis" / "qa-report.md"
    out.write_text("\n".join(L[:2] + header + L[2:]), encoding="utf-8")
    print("\n".join(header))
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
