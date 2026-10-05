#!/usr/bin/env python3
"""
make_stems.py — render the step-4 audio passes as STANDALONE deliverable stems.

tools/mix_sfx.py and tools/mix_music.py produce AUDITION videos (voice + cues, ducked) for
judging cues in context. This tool produces the thing you hand to an editor instead: separate,
full-length WAV tracks that start at master 0.000 and run the whole preview length, so each
drags onto the timeline at zero and lines up with the composited picture with no nudging.

Nothing is ducked here and no voice is included — ducking is the final mix's call. Per-cue
gain_db from the SFX plan and per-section gain_db from the music plan ARE baked in, because
those are the shape of the pass, not mix decisions.

  --voice    the master cut's audio          -> output/voice-track.wav (needed when the picture ships silent)
  --sfx      videos/<p>/work/sfx-plan.json   -> the plan's stem.out    (cues at master time, silence between)
  --music    videos/<p>/work/music-plan.json -> the plan's out         (sectioned, crossfade-looped bed)
  --pickup   a voice pickup padded from 0 to its graft time, plus a bare copy of the word

Usage (from the repo root, on the venv):
  venv/Scripts/python tools/make_stems.py videos/video-1 --all
  venv/Scripts/python tools/make_stems.py videos/video-1 --sfx
  venv/Scripts/python tools/make_stems.py videos/video-1 --pickup work/pickups/side-0264-492.20.wav \\
      --at 857.640 --name pickup-side

ffmpeg/ffprobe on PATH. Engine/library paths resolve against the repo root; project paths
against the CWD (run from the repo root, same rule as the rest of tools/).
"""
import json
import math
import os
import subprocess
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# ffmpeg's -filter_complex can outgrow the Windows command-line limit once a plan has ~100
# cues, so every graph in this tool is written to a file and passed with -filter_complex_script.
SCRATCH = os.path.join(ROOT, ".stems_tmp")


def rp(p):
    """Engine/LIBRARY paths (catalogs, clips) resolve against ROOT."""
    return p if os.path.isabs(p) else os.path.join(ROOT, p)


def proj(p):
    """PROJECT-data paths (plans, outputs) resolve against the CWD."""
    return p if os.path.isabs(p) else os.path.abspath(p)


def show(p):
    try:
        return os.path.relpath(p, ROOT)
    except ValueError:
        return p


def run(cmd, graph=None, tag=""):
    """Run ffmpeg. `graph` is a filter_complex written to a temp script file."""
    os.makedirs(SCRATCH, exist_ok=True)
    if graph is not None:
        gp = os.path.join(SCRATCH, f"graph_{tag or 'x'}.txt")
        with open(gp, "w", encoding="utf-8") as f:
            f.write(graph)
        cmd = cmd + ["-filter_complex_script", gp]
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.stderr.write("\nFFMPEG FAILED:\n  " + " ".join(cmd[:40]) + " ...\n" + r.stdout[-4000:] + "\n")
        raise SystemExit(1)
    return r.stdout


def probe(path, entries="format=duration"):
    return run(["ffprobe", "-v", "error", "-show_entries", entries,
                "-of", "default=nw=1:nk=1", path]).strip()


def finish(cmd, out, dur, sr, ch):
    """Common tail: exact length, 48k stereo, 24-bit PCM."""
    os.makedirs(os.path.dirname(out), exist_ok=True)
    return cmd + ["-ac", str(ch), "-ar", str(sr), "-c:a", "pcm_s24le",
                  "-t", f"{dur:.6f}", out]


# ---------------------------------------------------------------- SFX stem
def build_sfx(plan_path, batch=30):
    with open(plan_path, encoding="utf-8") as f:
        plan = json.load(f)
    stem = plan.get("stem", {})
    out = proj(stem.get("out", "output/sfx-track.wav"))
    dur = float(stem.get("duration_s", plan.get("render", {}).get("end_s", 60)))
    sr, ch = int(stem.get("sample_rate", 48000)), int(stem.get("channels", 2))

    with open(rp(plan.get("catalog", "media/library/sfx/catalog.json")), encoding="utf-8") as f:
        lib = {c["id"]: c for c in json.load(f).get("clips", [])}

    events, missing = [], set()
    for e in plan["events"]:
        clip = lib.get(e["sfx_id"])
        if not clip:
            missing.add(e["sfx_id"])
            continue
        p = rp(os.path.join("media", "library", "sfx", clip["file"]))
        if not os.path.exists(p):
            missing.add(e["sfx_id"] + " (file)")
            continue
        if float(e["at_s"]) >= dur:
            continue
        events.append({**e, "file": p})
    if missing:
        sys.exit("missing clips (run tools/gen_sfx.py): " + ", ".join(sorted(missing)))
    events.sort(key=lambda e: e["at_s"])
    print(f"sfx stem: {len(events)} cues -> {show(out)}  ({dur:.3f}s, {sr}Hz, {ch}ch, no duck)")

    # Batched so the input list stays well inside the OS argv limit; each batch is a
    # full-length, mostly-silent float WAV, then all batches are summed.
    os.makedirs(SCRATCH, exist_ok=True)
    parts = []
    for bi in range(0, len(events), batch):
        chunk = events[bi:bi + batch]
        cmd = ["ffmpeg", "-y", "-hide_banner", "-v", "error",
               "-f", "lavfi", "-t", f"{dur:.6f}", "-i", f"anullsrc=r={sr}:cl=stereo"]
        for e in chunk:
            cmd += ["-i", e["file"]]
        g, labels = [], ["[0:a]"]
        for i, e in enumerate(chunk):
            ms = int(round(float(e["at_s"]) * 1000))
            gain = float(e.get("gain_db", 0))
            g.append(f"[{i+1}:a]aformat=sample_rates={sr}:channel_layouts=stereo,"
                     f"adelay={ms}:all=1,volume={gain:.2f}dB[e{i}]")
            labels.append(f"[e{i}]")
        g.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0[mix]")
        pf = os.path.join(SCRATCH, f"sfx_part{bi//batch:02d}.wav")
        cmd += ["-map", "[mix]", "-ac", str(ch), "-ar", str(sr), "-c:a", "pcm_f32le",
                "-t", f"{dur:.6f}", pf]
        run(cmd, ";".join(g), f"sfx{bi}")
        parts.append(pf)
        print(f"  batch {bi//batch + 1}: cues {bi + 1}-{bi + len(chunk)}")

    cmd = ["ffmpeg", "-y", "-hide_banner", "-v", "error"]
    for p in parts:
        cmd += ["-i", p]
    if len(parts) == 1:
        g = "[0:a]anull[mix]"
    else:
        g = "".join(f"[{i}:a]" for i in range(len(parts))) + \
            f"amix=inputs={len(parts)}:normalize=0:dropout_transition=0[mix]"
    run(finish(cmd + ["-map", "[mix]"], out, dur, sr, ch), g, "sfxsum")
    return out


# ---------------------------------------------------------------- music stem
def build_music(plan_path):
    with open(plan_path, encoding="utf-8") as f:
        plan = json.load(f)
    out = proj(plan["out"])
    dur = float(plan["duration_s"])
    sr, ch = int(plan["sample_rate"]), int(plan["channels"])
    xf, xl = float(plan["crossfade_s"]), float(plan["loop_crossfade_s"])
    ref = float(plan["reference_rms_db"])
    beds = plan["beds"]

    with open(rp(plan.get("catalog", "media/library/music/catalog.json")), encoding="utf-8") as f:
        cat = {c["id"]: c for c in json.load(f).get("clips", [])}

    os.makedirs(SCRATCH, exist_ok=True)
    print(f"music stem: {len(plan['sections'])} sections -> {show(out)}  ({dur:.3f}s, no duck)")
    sec_files = []
    for s in plan["sections"]:
        bed_id = s["bed"]
        b = beds[bed_id]
        src = rp(os.path.join("media", "library", "music", cat[bed_id]["file"]))
        body_in, body_out = float(b["body_in"]), float(b["body_out"])
        L = body_out - body_in
        # section carries xf of tail so the next section can crossfade over it
        need = (s["end"] - s["start"]) + xf
        step = L - xl
        n = max(1, math.ceil((need - L) / step) + 1)

        cmd = ["ffmpeg", "-y", "-hide_banner", "-v", "error"]
        for _ in range(n):
            cmd += ["-ss", f"{body_in:.3f}", "-t", f"{L:.3f}", "-i", src]
        g, labels = [], []
        for k in range(n):
            f_in = "" if k == 0 else f",afade=t=in:st=0:d={xl:.2f}:curve=qsin"
            f_out = "" if k == n - 1 else f",afade=t=out:st={L - xl:.3f}:d={xl:.2f}:curve=qsin"
            delay = int(round(k * step * 1000))
            g.append(f"[{k}:a]aformat=sample_rates={sr}:channel_layouts=stereo"
                     f"{f_in}{f_out},adelay={delay}:all=1[l{k}]")
            labels.append(f"[l{k}]")
        loop = ("".join(labels) + f"amix=inputs={n}:normalize=0:dropout_transition=0[loop]"
                if n > 1 else "[l0]anull[loop]")
        g.append(loop)
        # optional per-bed taming (a bed that swings too wide reads as dropping out), then
        # body-match to the reference, then the section's artistic gain, then the tail fade
        comp = (b["compress"] + ",") if b.get("compress") else ""
        gain = ref - float(b["body_rms_db"]) + float(s["gain_db"])
        g.append(f"[loop]atrim=0:{need:.3f},asetpts=N/SR/TB,{comp}volume={gain:.2f}dB,"
                 f"afade=t=out:st={need - xf:.3f}:d={xf:.2f}:curve=qsin[sec]")
        sf = os.path.join(SCRATCH, f"music_s{s['n']:02d}.wav")
        run(finish(cmd + ["-map", "[sec]"], sf, need, sr, ch), ";".join(g), f"mus{s['n']}")
        sec_files.append((s, sf))
        print(f"  s{s['n']:<2} {s['start']:7.1f}->{s['end']:7.1f}  {bed_id:<14} "
              f"{n} loop(s)  match{ref - float(b['body_rms_db']):+5.1f}dB  art{float(s['gain_db']):+.0f}dB")

    cmd = ["ffmpeg", "-y", "-hide_banner", "-v", "error"]
    for _, sf in sec_files:
        cmd += ["-i", sf]
    g, labels = [], []
    for i, (s, _) in enumerate(sec_files):
        # sections after the first fade in over the previous section's carried tail
        f_in = "" if i == 0 else f"afade=t=in:st=0:d={xf:.2f}:curve=qsin,"
        g.append(f"[{i}:a]{f_in}adelay={int(round(s['start'] * 1000))}:all=1[s{i}]")
        labels.append(f"[s{i}]")
    g.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0[sum]")
    g.append(f"[sum]afade=t=in:st=0:d={float(plan['fade_in_s']):.2f}:curve=qsin,"
             f"afade=t=out:st={dur - float(plan['fade_out_s']):.3f}:d={float(plan['fade_out_s']):.2f}:curve=qsin,"
             f"alimiter=level_in=1:level_out=1:limit=0.97:level=disabled:latency=true[mix]")
    run(finish(cmd + ["-map", "[mix]"], out, dur, sr, ch), ";".join(g), "mussum")
    return out


# ---------------------------------------------------------------- voice stem
def build_voice(project, dur, sr=48000, ch=2):
    """The master cut's audio as its own full-length stem.

    Needed whenever the picture is delivered SILENT: the voice has to come from somewhere, and
    the composited preview is not it. Taken from the master (whose audio stream is a copy of the
    cut) rather than from a baked preview, which is a second AAC generation. Trimmed to the stem
    length, NOT level-adjusted and NOT spliced - the 'side' pickup stays a separate file.
    """
    tl_path = os.path.join(project, "work", "timeline.json")
    with open(tl_path, encoding="utf-8") as f:
        master = proj(json.load(f)["master"])
    out = os.path.join(project, "output", "voice-track.wav")
    run(finish(["ffmpeg", "-y", "-hide_banner", "-v", "error", "-i", master, "-map", "[mix]"],
               out, dur, sr, ch),
        f"[0:a]aformat=sample_rates={sr}:channel_layouts=stereo[mix]", "voice")
    print(f"voice stem: {show(master)} -> {show(out)}  ({dur:.3f}s, {sr}Hz, {ch}ch, unprocessed)")
    return out


# ---------------------------------------------------------------- pickup stem
def build_pickup(src, at_s, out, bare_out, dur, sr=48000, ch=2, gain_db=0.0):
    src = proj(src)
    ms = int(round(at_s * 1000))
    run(finish(["ffmpeg", "-y", "-hide_banner", "-v", "error", "-i", src, "-map", "[mix]"],
               proj(out), dur, sr, ch),
        # apad, or -t would only ever truncate: the source ends long before the stem does
        f"[0:a]aformat=sample_rates={sr}:channel_layouts=stereo,"
        f"volume={gain_db:.2f}dB,adelay={ms}:all=1,apad[mix]", "pick")
    run(["ffmpeg", "-y", "-hide_banner", "-v", "error", "-i", src,
         "-af", f"aformat=sample_rates={sr}:channel_layouts=stereo,volume={gain_db:.2f}dB",
         "-c:a", "pcm_s24le", proj(bare_out)])
    print(f"pickup: {show(proj(src))} @ master {at_s:.3f}s (gain {gain_db:+.1f} dB)"
          f" -> {show(proj(out))} + {show(proj(bare_out))}")
    return proj(out)


# ---------------------------------------------------------------- final mux
def final_mux(project, picture, tracks, out, dur, sr=48000, ch=2, abitrate="384k"):
    """Sum the chosen audio stems and mux them onto the picture WITHOUT re-encoding video.

    The picture is stream-copied, so this is minutes not hours. A safety limiter catches summed
    peaks; there is no ducking - per-cue gains already sit the SFX under the voice, and ducking
    is a mix decision that belongs to whoever asked for it.
    """
    cmd = ["ffmpeg", "-y", "-hide_banner", "-v", "error", "-i", proj(picture)]
    for t in tracks:
        cmd += ["-i", proj(t)]
    g = []
    for i, _ in enumerate(tracks, start=1):
        g.append(f"[{i}:a]aformat=sample_rates={sr}:channel_layouts=stereo[t{i}]")
    g.append("".join(f"[t{i}]" for i in range(1, len(tracks) + 1))
             + f"amix=inputs={len(tracks)}:normalize=0:dropout_transition=0[sum]")
    # level=disabled is LOAD-BEARING: alimiter's `level` defaults to TRUE, which normalizes the
    # output back up to the ceiling whenever limiting engages. With it on, this mix came out at
    # +0.4 dBTP, and LOWERING the limit made it louder (-15.5 LUFS, +0.7 dBTP), not quieter.
    # With auto-level off, limit=0.85 is a real -1.41 dBFS sample ceiling, which leaves room for
    # AAC's inter-sample overshoot and lands true peak under the -1 dBTP delivery convention.
    g.append("[sum]alimiter=level_in=1:level_out=1:limit=0.79:level=disabled:latency=true[mix]")
    os.makedirs(os.path.dirname(proj(out)), exist_ok=True)
    run(cmd + ["-map", "0:v:0", "-map", "[mix]",
               "-c:v", "copy", "-c:a", "aac", "-b:a", abitrate,
               "-t", f"{dur:.6f}", "-movflags", "+faststart", proj(out)],
        ";".join(g), "final")
    print(f"final: {os.path.basename(proj(picture))} + {len(tracks)} track(s) -> {show(proj(out))}")
    return proj(out)


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    project = proj(args[0])
    work = os.path.join(project, "work")
    do_all = "--all" in args
    results = []

    if do_all or "--voice" in args:
        with open(os.path.join(work, "sfx-plan.json"), encoding="utf-8") as f:
            results.append(build_voice(project, float(json.load(f)["stem"]["duration_s"])))
    if do_all or "--sfx" in args:
        results.append(build_sfx(os.path.join(work, "sfx-plan.json")))
    if do_all or "--music" in args:
        results.append(build_music(os.path.join(work, "music-plan.json")))
    if do_all or "--pickup" in args:
        i = args.index("--pickup") if "--pickup" in args else -1
        src = args[i + 1] if i >= 0 and i + 1 < len(args) and not args[i + 1].startswith("--") else None
        at = float(args[args.index("--at") + 1]) if "--at" in args else None
        name = args[args.index("--name") + 1] if "--name" in args else "pickup"
        gain = float(args[args.index("--gain") + 1]) if "--gain" in args else 0.0
        if src and at is not None:
            with open(os.path.join(work, "sfx-plan.json"), encoding="utf-8") as f:
                dur = float(json.load(f)["stem"]["duration_s"])
            outp = os.path.join(project, "output", f"{name}.wav")
            bare = os.path.join(project, "output", f"{name}-bare.wav")
            results.append(build_pickup(os.path.join(project, src) if not os.path.isabs(src) else src,
                                        at, outp, bare, dur, gain_db=gain))
        else:
            print("--pickup needs <src> and --at <seconds>; skipped")

    if "--final" in args:
        with open(os.path.join(work, "sfx-plan.json"), encoding="utf-8") as f:
            dur = float(json.load(f)["stem"]["duration_s"])
        o = os.path.join(project, "output")
        # picture + voice + the owed pickup + SFX. Music is deliberately NOT here.
        tracks = [os.path.join(o, "voice-track.wav"), os.path.join(o, "pickup-side.wav"),
                  os.path.join(o, "sfx-track.wav")]
        if "--with-music" in args:
            tracks.append(os.path.join(o, "music-track.wav"))
        if "--no-pickup" in args:
            tracks = [t for t in tracks if "pickup" not in t]
        results.append(final_mux(project, os.path.join(o, "video-4k-silent.mp4"),
                                 tracks, os.path.join(o, "video-4k-final.mp4"), dur))

    print()
    for r in results:
        d = probe(r)
        n = probe(r, "stream=duration_ts")
        print(f"  {show(r):<52} {d}s  ({n} samples)")


if __name__ == "__main__":
    main()
