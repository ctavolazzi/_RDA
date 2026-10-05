"""Convert AssemblyAI word JSON into a readable take-segmented view for cut analysis.

Usage: python tools/format_transcript.py video-1
Reads:  <project>/work/transcripts/<id>.json
Writes: <project>/work/analysis/takes-<id>.txt

Segments break on speech gaps > 0.8s. Filler words are marked inline with their
exact timestamps so they can be cut individually.
"""

import json
import sys
from pathlib import Path

GAP_MS = 800
FILLERS = {"um", "uh", "erm", "hmm", "mm", "mhm", "uhm"}


def fmt_time(ms: int) -> str:
    return f"{ms / 1000:.2f}"


def clock(ms: int) -> str:
    s = ms // 1000
    return f"{s // 60:02d}:{s % 60:02d}"


def main() -> None:
    project = Path(__file__).resolve().parent.parent / sys.argv[1]
    out_dir = project / "work" / "analysis"

    for tpath in sorted((project / "work" / "transcripts").glob("*.json")):
        words = json.loads(tpath.read_text()).get("words") or []
        lines = [f"# clip {tpath.stem} — {len(words)} words, ends {clock(words[-1]['end']) if words else '0'}"]
        seg_words, seg_start, prev_end, n = [], None, None, 0

        def flush() -> None:
            nonlocal seg_words, seg_start, n
            if seg_words:
                n += 1
                text = " ".join(seg_words)
                lines.append(f"#{n:02d} [{fmt_time(seg_start)} - {fmt_time(prev_end)}] ({clock(seg_start)}) {text}")
            seg_words, seg_start = [], None

        for w in words:
            if prev_end is not None and w["start"] - prev_end > GAP_MS:
                flush()
                lines.append(f"     -- pause {(w['start'] - prev_end) / 1000:.1f}s --")
            if seg_start is None:
                seg_start = w["start"]
            token = w["text"]
            if token.strip(".,?!").lower() in FILLERS:
                token = f"<<{token} {fmt_time(w['start'])}-{fmt_time(w['end'])}>>"
            seg_words.append(token)
            prev_end = w["end"]
        flush()

        out = out_dir / f"takes-{tpath.stem}.txt"
        out.write_text("\n".join(lines), encoding="utf-8")
        print(f"{tpath.stem}: {n} segments -> {out.name}")


if __name__ == "__main__":
    main()
