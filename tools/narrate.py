"""Narrate a video's script with a free local voice: Kokoro v1.0 (Apache 2.0), no account, no API key.

    python tools/narrate.py videos/script-to-render
    python tools/narrate.py videos/script-to-render --voice am_michael --speed 1.05

Reads every `Voice:` line in videos/<p>/script/script.md (at most one per `### S<n>` scene heading),
speaks it, and writes:

    media/projects/<p>/vo/S<n>.wav       the clips (git-ignored, rebuilt by this tool)
    remotion/src/shots/<p>/_vo.json      what the composition reads: the text, the voice, and each
                                         clip's measured length in frames (committed)

The composition starts each clip on a frame its scene exports and refuses to render a clip that runs past
the end of its scene, so a line that grows fails loudly instead of talking over the next scene.

Needs the venv (`pip install -r requirements.txt` brings kokoro-onnx). The first run downloads the model
(325 MB) and the voices (28 MB) from the kokoro-onnx GitHub release into ~/.cache/rda/kokoro (or
$RDA_KOKORO_DIR) and refuses files whose SHA-256 does not match.

Why Kokoro (D20, 2026-10-18): CT asked "I want a narrator por favor", then "a free one". There is no .env
here, so no ElevenLabs key. Kokoro runs on the CPU, and its weights and voices are Apache 2.0, so a video
that uses it can be monetized. Voices: af_heart (the default, Kokoro's best graded), af_bella, am_michael,
am_fenrir, bf_emma, bm_george, and more in the release's voices file.
"""
import argparse
import hashlib
import json
import math
import os
import re
import sys
import urllib.request
import wave
from pathlib import Path

RELEASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
FILES = {
    "kokoro-v1.0.onnx": "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5",
    "voices-v1.0.bin": "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
}
SCENE = re.compile(r"^###\s+(S\d+)\b")
VOICE = re.compile(r"^Voice:\s*(.+?)\s*$")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def model_dir():
    d = Path(os.environ.get("RDA_KOKORO_DIR") or Path.home() / ".cache" / "rda" / "kokoro")
    d.mkdir(parents=True, exist_ok=True)
    for name, want in FILES.items():
        path = d / name
        if not path.exists():
            print(f"downloading {name} into {d} (once)")
            part = path.with_suffix(path.suffix + ".part")
            urllib.request.urlretrieve(RELEASE + name, part)
            part.replace(path)
        got = sha256(path)
        if got != want:
            sys.exit(f"error: {path} has SHA-256 {got}, expected {want}. Delete it and run again.")
    return d


def read_lines(script):
    """Return {scene: text} for every `Voice:` line, in script order."""
    lines, scene = {}, None
    for n, raw in enumerate(script.read_text(encoding="utf-8").splitlines(), 1):
        m = SCENE.match(raw)
        if m:
            scene = m.group(1)
            continue
        m = VOICE.match(raw)
        if not m:
            continue
        if scene is None:
            sys.exit(f"error: {script}:{n}: a Voice: line before any ### S<n> heading")
        if scene in lines:
            sys.exit(f"error: {script}:{n}: a second Voice: line in {scene}; one per scene")
        lines[scene] = m.group(1).strip().strip('"')
    return lines


def write_wav(path, samples, rate):
    import numpy as np  # comes with kokoro-onnx

    pcm = (np.clip(np.asarray(samples, dtype=np.float32), -1.0, 1.0) * 32767).astype("<i2").tobytes()
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(pcm)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("project", help="videos/<p>")
    ap.add_argument("--voice", default="af_heart")
    ap.add_argument("--speed", type=float, default=1.0)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--timing", help="where to write _vo.json (default remotion/src/shots/<p>/_vo.json)")
    a = ap.parse_args()

    project = Path(a.project)
    slug = project.resolve().name
    script = project / "script" / "script.md"
    if not script.exists():
        sys.exit(f"error: no script at {script}")
    timing = Path(a.timing or f"remotion/src/shots/{slug}/_vo.json")
    if not timing.parent.exists():
        sys.exit(f"error: no shot folder {timing.parent} (run from the repo root, or pass --timing)")
    out = Path("media/projects") / slug / "vo"
    out.mkdir(parents=True, exist_ok=True)

    lines = read_lines(script)
    if not lines:
        sys.exit(f"error: no `Voice:` lines in {script}")

    try:
        from kokoro_onnx import Kokoro
        from importlib.metadata import version
    except ImportError:
        sys.exit("error: kokoro-onnx is missing. Use the venv: ./venv/bin/pip install -r requirements.txt")
    d = model_dir()
    kokoro = Kokoro(str(d / "kokoro-v1.0.onnx"), str(d / "voices-v1.0.bin"))
    lang = "en-gb" if a.voice.startswith("b") else "en-us"

    before = {}
    if timing.exists():
        before = {k: v.get("frames") for k, v in json.loads(timing.read_text(encoding="utf-8")).get("lines", {}).items()}

    result = {}
    for scene, text in lines.items():
        samples, rate = kokoro.create(text, voice=a.voice, speed=a.speed, lang=lang)
        wav = out / f"{scene}.wav"
        write_wav(wav, samples, rate)
        frames = math.ceil(len(samples) / rate * a.fps)
        result[scene] = {"text": text, "file": f"vo/{scene}.wav", "samples": len(samples), "frames": frames}
        was = before.get(scene)
        change = "new" if was is None else ("unchanged" if was == frames else f"was {was}")
        print(f"{scene:4} {frames:4d} frames  {len(samples) / rate:5.2f} s  ({change})  {text}")

    timing.write_text(
        json.dumps(
            {
                "note": f"Written by tools/narrate.py from {script.as_posix()}. Do not edit; change the script and run it again.",
                "engine": f"kokoro-onnx {version('kokoro-onnx')}, kokoro-v1.0.onnx",
                "voice": a.voice,
                "speed": a.speed,
                "fps": a.fps,
                "sampleRate": rate,
                "lines": result,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {len(result)} clips to {out.as_posix()}/ and timings to {timing.as_posix()}")


if __name__ == "__main__":
    main()
