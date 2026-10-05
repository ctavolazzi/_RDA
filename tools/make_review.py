"""Generate a human-readable audit doc from cuts.json.

Usage: python tools/make_review.py video-1
Reads:  <project>/work/analysis/cuts.json
Writes: <project>/work/analysis/review.md
"""

import json
import sys
from pathlib import Path

from cutlib import AudioProbe, active_keeps, load_words, plan_clip


def clock(sec: float) -> str:
    return f"{int(sec) // 60:02d}:{int(sec) % 60:02d}"


def main() -> None:
    project = Path(__file__).resolve().parent.parent / sys.argv[1]
    data = json.loads((project / "work" / "analysis" / "cuts.json").read_text(encoding="utf-8"))
    probe = AudioProbe(project)

    raw_total = sum(c["duration"] for c in data["clips"])
    lines = [f"# Cut review — {data['project']}", ""]
    lines.append(f"Raw footage: **{clock(raw_total)}** ({raw_total:.0f}s) across {len(data['clips'])} clips.")
    for name, style in data["styles"].items():
        est = 0.0
        for clip in data["clips"]:
            est += sum(e - s for s, e in plan_clip(clip["id"], active_keeps(clip), load_words(project, clip["id"]), style, probe, clip.get("cuts")))
        lines.append(f"- Estimated length, **{name}** style: **{clock(est)}** ({est:.0f}s)")

    fluff = [(c["id"], f) for c in data["clips"] for f in c.get("fluff_suggestions", [])]
    applied = [(cid, f) for cid, f in fluff if f.get("status") == "auto_applied"]
    sugg = [(cid, f) for cid, f in fluff if f.get("status") != "auto_applied"]
    if applied:
        lines += ["", "## Fluff AUTO-REMOVED (high confidence — tell me to undo any)", ""]
        for cid, f in applied:
            lines.append(f"- ❌ clip {cid} {clock(f['s'])}–{clock(f['e'])} · *{f.get('crit','')}* — "
                         f"\"{f['text'][:90]}{'…' if len(f['text']) > 90 else ''}\" — {f.get('note','')}")
    if sugg:
        lines += ["", "## Fluff suggestions — SUGGEST-ONLY (you decide)", ""]
        for cid, f in sugg:
            lines.append(f"- 💡 clip {cid} {clock(f['s'])}–{clock(f['e'])} · *{f.get('crit','')}* — "
                         f"\"{f['text'][:90]}{'…' if len(f['text']) > 90 else ''}\" — {f.get('note','')}")

    lines += ["", "## Flagged judgment calls", ""]
    for f in data.get("flags", []):
        lines.append(f"**FLAG {f['id']}** · clip {f['clip']} @ {f['at']} — {f['issue']} *(default: {f['default']})*")
        lines.append("")

    for clip in data["clips"]:
        events = [{"s": k["s"], "e": k["e"], "kind": "KEEP", "cat": "", "text": k["text"], "note": k.get("note", "")} for k in clip["keeps"]]
        events += [{"s": c["s"], "e": c["e"], "kind": "CUT", "cat": c["cat"], "text": c["text"], "note": c.get("note", "")} for c in clip["cuts"]]
        events += [{"s": f["s"], "e": f["e"], "kind": "FLUFF?", "cat": f.get("crit", ""), "text": f["text"], "note": f.get("note", "")} for f in clip.get("fluff_suggestions", [])]
        events.sort(key=lambda x: x["s"])
        lines += ["", f"## Clip {clip['id']} — {clock(clip['duration'])} raw, {len(clip['cuts'])} cuts", ""]
        lines.append("| | time | type | content | note |")
        lines.append("|---|---|---|---|---|")
        for ev in events:
            mark = {"KEEP": "✅", "CUT": "❌", "FLUFF?": "💡"}[ev["kind"]]
            text = ev["text"] if len(ev["text"]) <= 110 else ev["text"][:107] + "..."
            lines.append(f"| {mark} | {clock(ev['s'])}–{clock(ev['e'])} | {ev['kind']}{' ' + ev['cat'] if ev['cat'] else ''} | {text} | {ev['note']} |")

    out = project / "work" / "analysis" / "review.md"
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
