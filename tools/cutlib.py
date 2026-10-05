"""Shared cut-planning logic: word-aware segmentation, internal-pause compression,
and snap-to-audio tails. Used by render_cuts.py and analyze_cut.py.

General + parameterized — no per-video constants. All timing knobs come from the
`styles` block in cuts.json.
"""

import array
import json
import math
import wave
from pathlib import Path


def load_manifest(project: Path) -> dict:
    return json.loads((project / "work" / "editor" / "manifest.json").read_text())


def offsets(project: Path) -> dict:
    return {p["id"]: p["offset"] for p in load_manifest(project)["parts"]}


def load_words(project: Path, clip: str) -> list[dict]:
    """Word list for a clip, preferring the newest transcription dir."""
    for sub in ("transcripts-u35", "transcripts"):
        p = project / "work" / sub / f"{clip}.json"
        if p.exists():
            return json.loads(p.read_text()).get("words") or []
    return []


class AudioProbe:
    """RMS envelope over the 16k mono WAVs, for noise floor + snap-to-audio tails."""

    def __init__(self, project: Path):
        self.project = project
        self._samples: dict[str, tuple[array.array, int]] = {}
        self._floor: dict[str, float] = {}

    def _load(self, clip: str) -> tuple[array.array, int]:
        if clip not in self._samples:
            w = wave.open(str(self.project / "work" / "audio" / f"{clip}.wav"), "rb")
            sr = w.getframerate()
            data = array.array("h")
            data.frombytes(w.readframes(w.getnframes()))
            w.close()
            self._samples[clip] = (data, sr)
        return self._samples[clip]

    def rms_db(self, clip: str, t: float, win: float = 0.05) -> float:
        data, sr = self._load(clip)
        a = max(0, int(t * sr))
        b = min(len(data), int((t + win) * sr))
        if b <= a:
            return -120.0
        acc = 0.0
        for i in range(a, b):
            acc += data[i] * data[i]
        r = math.sqrt(acc / (b - a)) + 1e-9
        return 20 * math.log10(r / 32768)

    def floor_db(self, clip: str) -> float:
        if clip not in self._floor:
            data, sr = self._load(clip)
            step = int(0.05 * sr)
            vals = []
            for i in range(0, len(data) - step, step):
                acc = 0.0
                for j in range(i, i + step, 8):  # subsample for speed
                    acc += data[j] * data[j]
                r = math.sqrt(acc / (step / 8)) + 1e-9
                vals.append(20 * math.log10(r / 32768))
            vals.sort()
            self._floor[clip] = vals[len(vals) // 10]  # 10th percentile
        return self._floor[clip]

    def snap_tail(self, clip: str, word_end: float, min_tail: float, max_tail: float,
                  margin: float = 5.0) -> float:
        """Seconds to keep after word_end so the word's release fully decays to
        the noise floor. Small for clean words, larger for long-release endings."""
        floor = self.floor_db(clip)
        o = min_tail
        while o <= max_tail:
            if self.rms_db(clip, word_end + o) <= floor + margin:
                return round(o, 3)
            o += 0.02
        return max_tail


def active_keeps(clip: dict) -> list[dict]:
    """Keeps that survive AUTO-APPLIED fluff removal. Keeps are never deleted —
    a fluff span with status 'auto_applied' just hides the keeps it covers, so
    undo is a one-field flip back to 'suggested'."""
    applied = [(f["s"], f["e"]) for f in clip.get("fluff_suggestions", [])
               if f.get("status") == "auto_applied"]
    if not applied:
        return clip["keeps"]
    covered = lambda k: any(k["s"] >= s - 0.05 and k["e"] <= e + 0.05 for s, e in applied)
    return [k for k in clip["keeps"] if not covered(k)]


def split_atoms(keeps: list[dict], words: list[dict], internal_gap: float) -> list[tuple[float, float]]:
    """Speech-run atoms: keeps split at pauses >= internal_gap."""
    atoms: list[tuple[float, float]] = []
    for k in keeps:
        kw = [w for w in words if k["s"] - 0.02 <= w["start"] / 1000 and w["end"] / 1000 <= k["e"] + 0.02]
        if not kw:
            atoms.append((k["s"], k["e"]))
            continue
        run_s = kw[0]["start"] / 1000
        for a, b in zip(kw, kw[1:]):
            if b["start"] / 1000 - a["end"] / 1000 >= internal_gap:
                atoms.append((run_s, a["end"] / 1000))
                run_s = b["start"] / 1000
        atoms.append((run_s, kw[-1]["end"] / 1000))
    return atoms


def tail_for(probe: AudioProbe, clip: str, word_end: float, gap, style: dict) -> tuple[float, bool]:
    """Tail seconds after word_end. A large following gap (section end / removed
    retake) gets a SOFT landing (more room, closer decay to floor); a small
    mid-flow pause gets a punchy tail. Returns (tail, is_soft)."""
    soft = gap is None or gap >= style["soft_gap"]
    if soft:
        tail = probe.snap_tail(clip, word_end, style["min_tail"], style["soft_max_tail"], style["soft_margin"])
    else:
        tail = probe.snap_tail(clip, word_end, style["min_tail"], style["max_tail"], style.get("margin", 5.0))
    if gap is not None:  # never cross into the next atom's lead-in
        tail = min(tail, max(gap - style["head"] - 0.06, style["min_tail"] * 0.5))
    return tail, soft


def plan_clip(clip: str, keeps: list[dict], words: list[dict], style: dict,
              probe: AudioProbe, cuts: list[dict] | None = None) -> list[tuple[float, float]]:
    """Render ranges (raw seconds): speech-run atoms with snapped tails and
    compressed pauses. Section ends land soft, mid-flow pauses land punchy.

    `cuts` (optional) are the clip's cut spans. Pass them whenever they exist: a
    tail or head must never run INTO a span the editor explicitly cut. snap_tail
    walks forward until the audio decays, so when the material right after an atom
    is cut SPEECH rather than silence it walks straight through it and the cut
    words ride into the render (measured: 0.70s of a cut 'for quick demo—' survived
    this way). The gap clamp in tail_for does not catch it — it only stops the tail
    reaching the next KEPT atom, and a cut span sits in between."""
    atoms = split_atoms(keeps, words, style["internal_gap"])
    head = style["head"]
    spans = sorted((c["s"], c["e"]) for c in (cuts or []))
    segs: list[tuple[float, float]] = []
    for i, (s, e) in enumerate(atoms):
        gap = atoms[i + 1][0] - e if i + 1 < len(atoms) else None
        tail, _ = tail_for(probe, clip, e, gap, style)
        open_head = head if i > 0 else min(0.25, head * 2)
        seg_s, seg_e = max(s - open_head, 0.0), e + tail
        for cs, ce in spans:
            if e <= cs < seg_e:        # a cut starts inside our tail
                seg_e = cs
            if seg_s < ce <= s:        # a cut ends inside our lead-in
                seg_s = ce
        segs.append((seg_s, max(seg_e, e)))
    return segs


def internal_pauses(keeps: list[dict], words: list[dict], threshold: float) -> list[dict]:
    """Pauses >= threshold that sit INSIDE kept speech (dead air while talking)."""
    out = []
    for k in keeps:
        kw = [w for w in words if k["s"] - 0.02 <= w["start"] / 1000 and w["end"] / 1000 <= k["e"] + 0.02]
        for a, b in zip(kw, kw[1:]):
            gap = b["start"] / 1000 - a["end"] / 1000
            if gap >= threshold:
                out.append({"at": a["end"] / 1000, "gap": round(gap, 2),
                            "before": a["text"], "after": b["text"]})
    return out
