#!/usr/bin/env python3
"""
bake.py — hybrid ffmpeg assembler for the AI Video Editor (step 2 / step 5 preview).

Reads a timeline.json that maps Remotion shots onto the master cut and
bakes a flat preview:
  - master AUDIO plays throughout (the human cut is the spine);
  - 'cutaway' spans REPLACE the master video with the shot's mp4;
  - 'overlay' spans COMPOSITE an alpha shot (.mov, ProRes 4444) over the master;
  - 'split' spans scale+crop the master into a box ("master_box", design-space
    1920x1080 px) and composite an alpha shot (.mov) OVER it — a split screen /
    pip where the TSX draws everything and leaves a transparent window for the
    master. Optional "master_crop_cx"/"master_crop_cy" (0..1, default 0.5) pick
    the crop center so the face stays framed at any box aspect; optional
    "master_crop_zoom" (>=1, default 1) tightens the crop for a closeup pip
    (e.g. a circle-hole face pip needs the face, not the full frame);
  - 'insert' entries PAUSE the master clock at "master_at_s": the insert shot's
    mp4 plays in full (video AND its own audio) while the master (and any
    cutaway running across that point) freezes, then everything resumes. The
    timeline stays in master seconds; every later beat lands "duration_s" later
    in the OUTPUT. Total output = preview.end_s + sum of insert durations;
  - everywhere else the master video passes through.

Method: split [0, end] into atomic segments at every shot boundary, render each
segment to an identically-encoded clip, concat them, then mux master audio 0..end.
Frame-accurate: per-segment frame counts come from rounded cumulative boundaries so
the total matches the audio exactly (no cumulative drift).

Usage:
  python tools/bake.py [video-1/work/timeline.json] [--end SECONDS] [--keep]
"""
import json
import os
import subprocess
import sys
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def proj(p):
    """Resolve PROJECT-data paths (timeline, master, preview out) relative to the CURRENT
    WORKING DIR — i.e. the type workspace you run from (longs/), where video-N lives — NOT
    relative to ROOT (=core/, the shared engine). Engine/library paths still use ROOT."""
    return p if os.path.isabs(p) else os.path.abspath(p)


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.stderr.write("\nFFMPEG FAILED:\n  " + " ".join(cmd) + "\n" + r.stdout[-4000:] + "\n")
        raise SystemExit(1)
    return r.stdout


def main():
    args = sys.argv[1:]
    keep = "--keep" in args
    args = [a for a in args if a != "--keep"]
    end_override = None
    if "--end" in args:
        i = args.index("--end")
        end_override = float(args[i + 1])
        del args[i:i + 2]
    tl_path = proj(args[0]) if args else proj(os.path.join("video-1", "work", "timeline.json"))

    with open(tl_path, "r", encoding="utf-8") as f:
        tl = json.load(f)

    master = proj(tl["master"])                                     # project data -> CWD
    out_dir = os.path.join(ROOT, tl.get("remotion_out", "remotion/out"))  # engine -> ROOT
    pv = tl["preview"]
    END = end_override if end_override is not None else float(pv["end_s"])
    W, H, FPS = int(pv["width"]), int(pv["height"]), int(pv["fps"])
    out_path = proj(pv["out"])                                      # project data -> CWD
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    # Encoder is overridable from the timeline's preview block. The 1080p30 defaults below are
    # what every preview bake has always used; a 4K60 bake needs the GPU (libx264 at 4K60 is
    # hours per pass, and bake encodes twice: once per segment, once on the concat).
    VSEG = pv.get("vcodec_seg") or ["-c:v", "libx264", "-crf", "18"]
    VOUT = pv.get("vcodec_out") or ["-c:v", "libx264", "-crf", "20", "-preset", "medium"]
    WITH_AUDIO = bool(pv.get("audio", True))

    # resolve each shot to its rendered file (cutaway/insert->.mp4, overlay/split->.mov)
    shots = []
    inserts = []
    for s in tl["shots"]:
        if s["type"] == "insert":
            at = float(s["master_at_s"])
            if at >= END:
                continue
            f = os.path.join(out_dir, s["id"] + ".mp4")
            if not os.path.exists(f):
                raise SystemExit(f"missing rendered insert: {f} (render it first: render-all {s['id']})")
            inserts.append({"id": s["id"], "at": at, "dur": float(s["duration_s"]),
                            "gain_db": float(s.get("gain_db", 0.0)), "file": f})
            continue
        a = max(0.0, float(s["master_in_s"]))
        b = min(END, float(s["master_out_s"]))
        if b <= a:
            continue  # entirely past the preview window
        ext = ".mov" if s["type"] in ("overlay", "split") else ".mp4"
        f = os.path.join(out_dir, s["id"] + ext)
        if not os.path.exists(f):
            raise SystemExit(f"missing rendered shot: {f} (render it first: npm run render / render-all {s['id']})")
        shots.append({"id": s["id"], "type": s["type"], "in": a, "out": b, "file": f,
                      "box": s.get("master_box"), "cx": float(s.get("master_crop_cx", 0.5)),
                      "cy": float(s.get("master_crop_cy", 0.5)),
                      "zoom": max(1.0, float(s.get("master_crop_zoom", 1.0)))})

    inserts.sort(key=lambda i: i["at"])
    cutaways = [s for s in shots if s["type"] == "cutaway"]
    overlays = [s for s in shots if s["type"] == "overlay"]
    splits = [s for s in shots if s["type"] == "split"]
    for s in splits:
        if not s["box"]:
            raise SystemExit(f"split shot {s['id']} needs a master_box {{x,y,w,h}} in timeline.json")

    # atomic segment boundaries (insert points are boundaries too: the insert
    # clip is injected between the segment ending at `at` and the one resuming there)
    bounds = {0.0, END}
    for s in shots:
        bounds.add(s["in"])
        bounds.add(s["out"])
    for ins in inserts:
        bounds.add(ins["at"])
    bounds = sorted(b for b in bounds if 0.0 <= b <= END)

    scratch = os.path.join(os.path.dirname(out_path), "_bake_tmp")
    if os.path.exists(scratch):
        shutil.rmtree(scratch)
    os.makedirs(scratch)

    seg_files = []
    total_ins = sum(i["dur"] for i in inserts)
    print(f"master={os.path.relpath(master, ROOT)}  end={END}s (+{total_ins:.2f}s inserts)  {W}x{H}@{FPS}")
    print("segments:")

    def render_insert(ins):
        n_ins = round(ins["dur"] * FPS)
        seg = os.path.join(scratch, f"ins_{ins['id']}.mp4")
        print(f"  [INSERT @{ins['at']:6.2f}] {n_ins:4d}f  insert:{ins['id']} ({ins['dur']:.2f}s, own audio)")
        run(["ffmpeg", "-y", "-i", ins["file"],
             "-vf", f"scale={W}:{H}:force_original_aspect_ratio=disable,fps={FPS},tpad=stop_mode=clone:stop_duration=1,format=yuv420p",
             "-frames:v", str(n_ins), "-an", *VSEG, "-pix_fmt", "yuv420p", seg])
        seg_files.append(seg)

    for i in range(len(bounds) - 1):
        a, b = bounds[i], bounds[i + 1]
        for ins in inserts:
            if abs(ins["at"] - a) < 1e-6:
                render_insert(ins)
        if b - a < 1e-4:
            continue
        # exact frame count from rounded cumulative boundaries (no drift)
        n = round(b * FPS) - round(a * FPS)
        if n <= 0:
            continue
        dur = n / FPS
        seg = os.path.join(scratch, f"seg_{i:03d}.mp4")

        cut = next((c for c in cutaways if c["in"] <= a + 1e-6 and a < c["out"] - 1e-6), None)
        ov = next((o for o in overlays if o["in"] <= a + 1e-6 and b <= o["out"] + 1e-6), None)
        sp_ = next((s for s in splits if s["in"] <= a + 1e-6 and a < s["out"] - 1e-6), None)

        common_vf = f"scale={W}:{H}:force_original_aspect_ratio=disable,fps={FPS},tpad=stop_mode=clone:stop_duration=1,format=yuv420p"

        if sp_:
            off = a - sp_["in"]
            kind = f"split:{sp_['id']} @+{off:.2f}s"
            # design-space (1920x1080) box -> output px
            box = sp_["box"]
            bx, by = round(box["x"] * W / 1920), round(box["y"] * H / 1080)
            bw, bh = round(box["w"] * W / 1920), round(box["h"] * H / 1080)
            bw, bh = bw - bw % 2, bh - bh % 2
            asp = bw / bh
            zm = sp_["zoom"]
            crop = (f"crop=w='min(iw,ih*{asp:.6f})/{zm:.4f}':h='min(ih,iw/{asp:.6f})/{zm:.4f}'"
                    f":x='clip({sp_['cx']:.4f}*iw-ow/2,0,iw-ow)':y='clip({sp_['cy']:.4f}*ih-oh/2,0,ih-oh)'")
            fc = (f"color=c=black:s={W}x{H}:r={FPS}[bg];"
                  f"[0:v]{crop},scale={bw}:{bh},fps={FPS},format=yuv420p[pip];"
                  f"[bg][pip]overlay={bx}:{by}[base];"
                  f"[1:v]scale={W}:{H},fps={FPS}[ov];"
                  f"[base][ov]overlay=0:0:format=auto,"
                  f"tpad=stop_mode=clone:stop_duration=1,format=yuv420p[v]")
            cmd = ["ffmpeg", "-y", "-ss", f"{a:.4f}", "-i", master,
                   "-ss", f"{off:.4f}", "-i", sp_["file"],
                   "-filter_complex", fc, "-map", "[v]", "-frames:v", str(n), "-an",
                   *VSEG, "-pix_fmt", "yuv420p", seg]
        elif cut:
            off = a - cut["in"]
            kind = f"cutaway:{cut['id']} @+{off:.2f}s"
            cmd = ["ffmpeg", "-y", "-ss", f"{off:.4f}", "-i", cut["file"],
                   "-vf", common_vf, "-frames:v", str(n), "-an",
                   *VSEG, "-pix_fmt", "yuv420p", seg]
        elif ov:
            off = a - ov["in"]
            kind = f"master+overlay:{ov['id']} @+{off:.2f}s"
            fc = (f"[0:v]scale={W}:{H},fps={FPS},format=yuv420p[bg];"
                  f"[1:v]scale={W}:{H},fps={FPS}[ov];"
                  f"[bg][ov]overlay=0:0:format=auto,"
                  f"tpad=stop_mode=clone:stop_duration=1,format=yuv420p[v]")
            cmd = ["ffmpeg", "-y", "-ss", f"{a:.4f}", "-i", master,
                   "-ss", f"{off:.4f}", "-i", ov["file"],
                   "-filter_complex", fc, "-map", "[v]", "-frames:v", str(n), "-an",
                   *VSEG, "-pix_fmt", "yuv420p", seg]
        else:
            kind = "master"
            cmd = ["ffmpeg", "-y", "-ss", f"{a:.4f}", "-i", master,
                   "-vf", common_vf, "-frames:v", str(n), "-an",
                   *VSEG, "-pix_fmt", "yuv420p", seg]

        print(f"  [{a:6.2f}-{b:6.2f}] {n:4d}f  {kind}")
        run(cmd)
        seg_files.append(seg)

    # concat (re-encode) + mux audio. Without inserts the audio is master 0..END;
    # with inserts it is master[0..t1] + insert1 audio + master[t1..t2] + ... so
    # the narration pauses exactly where the video does.
    listf = os.path.join(scratch, "segs.txt")
    with open(listf, "w", encoding="utf-8") as f:
        for s in seg_files:
            f.write(f"file '{s.replace(os.sep, '/')}'\n")

    TOTAL = END + total_ins
    print(("concat + audio -> " if WITH_AUDIO else "concat (no audio) -> ") + os.path.relpath(out_path, ROOT))
    cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", listf]
    if WITH_AUDIO and inserts:
        cmd += ["-i", master]
        for ins in inserts:
            cmd += ["-i", ins["file"]]
        FMT = "aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo"
        parts, labels, t_prev = [], [], 0.0
        for k, ins in enumerate(inserts):
            parts.append(f"[1:a]atrim=start={t_prev:.4f}:end={ins['at']:.4f},asetpts=PTS-STARTPTS,{FMT}[am{k}]")
            # positive gain gets a limiter so boosted peaks can't clip
            gain = f",volume={ins['gain_db']:.1f}dB,alimiter=limit=0.97:level=false" if abs(ins["gain_db"]) > 0.01 else ""
            parts.append(f"[{k + 2}:a]atrim=start=0:end={ins['dur']:.4f},asetpts=PTS-STARTPTS,{FMT}{gain}[ai{k}]")
            labels += [f"[am{k}]", f"[ai{k}]"]
            t_prev = ins["at"]
        parts.append(f"[1:a]atrim=start={t_prev:.4f}:end={END:.4f},asetpts=PTS-STARTPTS,{FMT}[amz]")
        labels.append("[amz]")
        fc = ";".join(parts) + f";{''.join(labels)}concat=n={len(labels)}:v=0:a=1[aout]"
        cmd += ["-filter_complex", fc, "-map", "0:v:0", "-map", "[aout]"]
    elif WITH_AUDIO:
        cmd += ["-i", master, "-map", "0:v:0", "-map", "1:a:0"]
    else:
        cmd += ["-map", "0:v:0", "-an"]
    cmd += [*VOUT, "-pix_fmt", "yuv420p", "-r", str(FPS)]
    if WITH_AUDIO:
        cmd += ["-c:a", "aac", "-b:a", "192k"]
    cmd += ["-t", f"{TOTAL:.4f}", "-movflags", "+faststart", out_path]
    run(cmd)

    if not keep:
        shutil.rmtree(scratch)
    dur = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=nw=1:nk=1", out_path]).strip()
    print(f"done -> {os.path.relpath(out_path, ROOT)}  ({dur}s)")


if __name__ == "__main__":
    main()
