#!/usr/bin/env python3
"""
master_audio.py: master a finished video's audio to a delivery loudness, video stream copied.

  python tools/master_audio.py remotion/out/RdaExplainer.mp4
  python tools/master_audio.py in.mp4 -o out.mp4 --lufs -16 --tp -1.5
  python tools/master_audio.py in.mp4 --static      # one fixed gain + limiter, keeps the mix's dynamics

Two-pass ffmpeg loudnorm (measure, then apply linearly) followed by a peak limiter, then
re-measures and prints the result. The video stream is copied, never re-encoded.

Why (_RDA, 2026-10-05): the first RDA explainer export measured -32 LUFS. The music bed was mixed
as if a voice would sit on top, and there was no voice. YouTube turns loud videos down but never
turns quiet ones up, so a quiet export stays quiet. loudnorm alone in linear mode overshot the
true-peak target (-0.8 vs -1.5 dBTP), which is why the limiter is there.

Why --static (2026-10-18): loudnorm only stays linear when the source LRA is under the target LRA and
the gain fits under the true-peak ceiling; otherwise ffmpeg quietly switches it to dynamic mode. A
mix of quiet music under sharp sound effects (no voice) fails both, and dynamic mode lifted the quiet
bed until the effects were only a few dB above it. --static applies one fixed gain to reach the target
and lets the limiter catch the peaks, so the balance set in the mix survives. The default run now
says when loudnorm went dynamic. In --static mode a 16 kHz roll-off runs before the limiter and the
limiter sits 2 dB under the ceiling: hard-limited clicks and typing made the AAC encode ring up to
+6.5 dBTP without them (AAC drops that band at 192k anyway). Up to two more passes add back the loudness
the limiter shaved off, so the result lands on the target.

Needs ffmpeg on PATH. No pip dependencies. For a talking-head video the voice and music mix belongs
to tools/mix_music.py first; this is the last step before upload.
"""
import argparse
import json
import math
import os
import re
import subprocess
import sys


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def measure(path):
    """Integrated loudness (LUFS) and true peak (dBTP) via ebur128."""
    p = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"])
    summary = p.stderr[p.stderr.rfind("Summary:"):]
    i = re.search(r"I:\s+(-?[\d.]+) LUFS", summary)
    tp = re.search(r"Peak:\s+(-?[\d.]+|-inf) dBFS", summary)
    if not i:
        sys.exit(f"master_audio: could not measure {path}. Does it have an audio stream?\n{p.stderr[-800:]}")
    return float(i.group(1)), (float(tp.group(1)) if tp and tp.group(1) != "-inf" else None)


def main():
    ap = argparse.ArgumentParser(description="master a video's audio to a delivery loudness")
    ap.add_argument("input")
    ap.add_argument("-o", "--output", help="default: <input>-master.mp4 next to the input")
    ap.add_argument("--lufs", type=float, default=-16.0, help="integrated loudness target (default -16)")
    ap.add_argument("--tp", type=float, default=-1.5, help="true-peak ceiling in dBTP (default -1.5)")
    ap.add_argument("--lra", type=float, default=11.0)
    ap.add_argument("--static", action="store_true",
                    help="one fixed gain to the target, then the limiter; never dynamic loudnorm")
    a = ap.parse_args()

    if not os.path.exists(a.input):
        sys.exit(f"master_audio: no such file {a.input}")
    out = a.output or re.sub(r"(\.\w+)$", r"-master\1", a.input)
    if os.path.abspath(out) == os.path.abspath(a.input):
        sys.exit("master_audio: output must differ from input")

    before_i, before_tp = measure(a.input)
    # limiter ceiling a little under the target, as a linear amplitude
    limit = round(math.pow(10, (a.tp - 0.5) / 20), 4)
    if a.static:
        s_limit = round(math.pow(10, (a.tp - 2.0) / 20), 4)
        gain = round(a.lufs - before_i, 2)
        for attempt in (1, 2, 3):
            chain = (f"lowpass=f=16000:poles=2,volume={gain}dB,"
                     f"alimiter=limit={s_limit}:attack=1:level=false,aresample=48000")
            p = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", a.input, "-c:v", "copy",
                     "-af", chain, "-c:a", "aac", "-b:a", "192k", out])
            if p.returncode != 0:
                sys.exit(f"master_audio: ffmpeg failed\n{p.stderr[-800:]}")
            got_i, _ = measure(out)
            print(f"static pass {attempt}: gain {gain:+.2f} dB, limiter at {a.tp - 2.0} dBFS -> {got_i:.1f} LUFS")
            if abs(got_i - a.lufs) <= 0.3:
                break
            gain = round(gain + min(3.0, a.lufs - got_i), 2)
    else:
        target = f"I={a.lufs}:TP={a.tp}:LRA={a.lra}"
        p = run(["ffmpeg", "-hide_banner", "-i", a.input, "-af", f"loudnorm={target}:print_format=json", "-f", "null", "-"])
        m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", p.stderr, re.S)
        if not m:
            sys.exit(f"master_audio: loudnorm measurement failed\n{p.stderr[-800:]}")
        d = json.loads(m.group(0))
        measured = (f"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}"
                    f":measured_thresh={d['input_thresh']}:offset={d['target_offset']}")
        chain = f"loudnorm={target}:{measured}:linear=true,alimiter=limit={limit}:level=false,aresample=48000"
        p = run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", a.input, "-c:v", "copy",
                 "-af", chain, "-c:a", "aac", "-b:a", "192k", out])
        if p.returncode != 0:
            sys.exit(f"master_audio: ffmpeg failed\n{p.stderr[-800:]}")
        # loudnorm reports the mode it really used; it drops to dynamic without failing
        q = run(["ffmpeg", "-hide_banner", "-i", a.input, "-af", f"loudnorm={target}:{measured}:linear=true:print_format=json",
                 "-f", "null", "-"])
        mode = re.search(r'"normalization_type"\s*:\s*"(\w+)"', q.stderr)
        if mode and mode.group(1) != "linear":
            print(f"note: loudnorm ran in {mode.group(1)} mode (source LRA {d['input_lra']} LU, TP {d['input_tp']} dBTP);"
                  " it compresses the mix. Use --static to keep the balance.")

    after_i, after_tp = measure(out)
    print(f"before  {before_i:6.1f} LUFS  {before_tp if before_tp is not None else '-inf':>6} dBTP")
    print(f"after   {after_i:6.1f} LUFS  {after_tp if after_tp is not None else '-inf':>6} dBTP   -> {out}")
    ok = abs(after_i - a.lufs) <= 1.0 and (after_tp is None or after_tp <= a.tp + 0.1)
    if not ok:
        print(f"WARNING: missed the target ({a.lufs} LUFS, {a.tp} dBTP). Check the mix before upload.")
        sys.exit(1)


if __name__ == "__main__":
    main()
