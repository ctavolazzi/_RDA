"""Generate short video clips with fal.ai (image-to-video / text-to-video).

Usage:
  python tools/gen_video.py --image ref.jpg --prompt "..." --out media/projects/video-1/shock.mp4
  python tools/gen_video.py --image ref.jpg --prompt "..." --model fal-ai/veo3.1/image-to-video \
      --duration 5 --out out.mp4
  python tools/gen_video.py --list-models

For generated beats that TSX cannot fake: physical gags, presenter-likeness inserts, the B14
ladder. Everything a browser/terminal/diagram can show should still be a Remotion shot.

Reference image: pass a LOCAL file. It is inlined as a base64 data URI, so no upload step and
nothing of the presenter's likeness leaves the machine except to fal for this one request.
For likeness continuity, extract the reference from the master at the cut point, e.g.
  ffmpeg -ss 63.64 -i videos/video-1/output/master-natural-h264.mp4 -frames:v 1 ref.jpg
so the generated clip continues the real take (same wardrobe, room, light, framing).

Cost (fal, 2026): kling 2.5 turbo pro ~$0.07/s, seedance 1.5 pro ~$0.05/s, veo 3.1 ~$0.20/s
(no audio). A 5s kling attempt is ~$0.35, so iterate on kling and escalate to veo only if
prompt adherence fails. Audio is never needed here: bake.py muxes the MASTER audio over
everything, so any generated audio track is discarded.

Duration spelling differs per family and the CLI hides that: pass `--duration 8` OR
`--duration 8s` and the right form is sent (veo 3.1 only accepts '4s' | '6s' | '8s';
kling/seedance want a bare number). veo also defaults to 720p unless you ask, so pass
`--resolution 1080p` for anything that goes full-bleed — the field is only sent when
given, so models that reject it are unaffected.
"""

import argparse
import base64
import json
import mimetypes
import sys
import time
from pathlib import Path

import requests

QUEUE = "https://queue.fal.run"

# Image-to-video endpoints, cheapest-first. Prices are per second of OUTPUT.
MODELS = {
    "kling": ("fal-ai/kling-video/v2.5-turbo/pro/image-to-video", 0.07,
              "cheap, good motion, iterate here first"),
    "seedance": ("fal-ai/bytedance/seedance/v1/pro/image-to-video", 0.05,
                 "tops the i2v leaderboard, strong cinematic motion"),
    "veo": ("fal-ai/veo3.1/image-to-video", 0.20,
            "best prompt adherence — use when the action is complex"),
}


def load_env_key(repo_root: Path, name: str) -> str:
    """Same .env convention as tools/transcribe.py."""
    env = repo_root / ".env"
    if not env.exists():
        sys.exit(f"no .env at {env}")
    for line in env.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line.startswith(name + "="):
            value = line.split("=", 1)[1].strip().strip('"').strip("'")
            if value:
                return value
    sys.exit(f"{name} not found in .env  (add it: {name}=...)")


def duration_seconds(raw: str) -> float:
    """'8' and '8s' both mean eight seconds. Used only for the cost estimate."""
    try:
        return float(str(raw).strip().rstrip("sS"))
    except ValueError:
        return 0.0


def duration_field(raw: str, endpoint: str) -> str:
    """Emit the spelling this endpoint actually validates.

    veo 3.1 rejects "8" — it enums on '4s' | '6s' | '8s'. kling and seedance
    reject "8s" — they want the bare number. Accept either on the CLI so a
    caller never has to remember which family they are on.
    """
    n = str(raw).strip().rstrip("sS")
    return f"{n}s" if "veo" in endpoint else n


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "image/jpeg"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def submit(headers: dict, endpoint: str, payload: dict) -> dict:
    r = requests.post(f"{QUEUE}/{endpoint}", headers=headers, json=payload, timeout=120)
    if r.status_code != 200:
        sys.exit(f"submit failed HTTP {r.status_code}: {r.text[:1500]}")
    return r.json()


def poll(headers: dict, status_url: str, response_url: str, timeout_s: int) -> dict:
    t0 = time.time()
    last = None
    while time.time() - t0 < timeout_s:
        r = requests.get(status_url, headers=headers, timeout=60)
        r.raise_for_status()
        st = r.json()
        state = st.get("status")
        if state != last:
            print(f"  {state}" + (f" (queue position {st['queue_position']})"
                                  if st.get("queue_position") is not None else ""), flush=True)
            last = state
        if state == "COMPLETED":
            rr = requests.get(response_url, headers=headers, timeout=120)
            rr.raise_for_status()
            return rr.json()
        if state in ("FAILED", "CANCELLED", "ERROR"):
            sys.exit(f"job {state}: {json.dumps(st)[:1500]}")
        time.sleep(3)
    sys.exit(f"timed out after {timeout_s}s (job may still finish; re-poll {status_url})")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", help="local reference image for image-to-video")
    ap.add_argument("--prompt")
    ap.add_argument("--negative-prompt", default="blur, distort, low quality, text, watermark, "
                                                 "deformed face, extra limbs, extra fingers")
    ap.add_argument("--model", default="kling",
                    help="alias (kling|seedance|veo) or a full fal endpoint id")
    ap.add_argument("--duration", default="5",
                    help="seconds of generated video, with or without a trailing 's' "
                         "(kling: 5 or 10 · veo 3.1: 4, 6 or 8)")
    ap.add_argument("--resolution", help="e.g. 720p or 1080p; only sent when given "
                                         "(veo 3.1 defaults to 720p without it)")
    ap.add_argument("--cfg-scale", type=float, default=0.5)
    ap.add_argument("--out", help="where to write the mp4")
    ap.add_argument("--timeout", type=int, default=900)
    ap.add_argument("--list-models", action="store_true")
    ap.add_argument("--save-json", action="store_true", help="also write the raw fal response")
    args = ap.parse_args()

    if args.list_models:
        for alias, (ep, price, note) in MODELS.items():
            print(f"  {alias:9} ${price:.2f}/s  {ep}\n            {note}")
        return

    for req in ("prompt", "out"):
        if not getattr(args, req):
            sys.exit(f"--{req} is required")

    repo_root = Path(__file__).resolve().parent.parent
    headers = {"Authorization": "Key " + load_env_key(repo_root, "FAL_KEY"),
               "Content-Type": "application/json"}

    endpoint, price, _ = MODELS.get(args.model, (args.model, None, ""))
    duration = duration_field(args.duration, endpoint)
    payload = {"prompt": args.prompt, "duration": duration,
               "negative_prompt": args.negative_prompt, "cfg_scale": args.cfg_scale}
    if args.resolution:
        payload["resolution"] = args.resolution
    if args.image:
        img = Path(args.image)
        if not img.exists():
            sys.exit(f"no such image: {img}")
        payload["image_url"] = data_uri(img)
        print(f"reference: {img}  ({img.stat().st_size // 1024} KB, inlined)")

    est = f"~${price * duration_seconds(args.duration):.2f}" if price else "unknown"
    res = f"   resolution: {args.resolution}" if args.resolution else ""
    print(f"model: {endpoint}\nduration: {duration}   est cost: {est}{res}")
    print(f"prompt: {args.prompt}")

    job = submit(headers, endpoint, payload)
    print(f"submitted {job['request_id']}")
    result = poll(headers, job["status_url"], job["response_url"], args.timeout)

    video = (result.get("video") or {}).get("url")
    if not video:
        sys.exit(f"no video in response: {json.dumps(result)[:1500]}")

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with requests.get(video, stream=True, timeout=600) as r:
        r.raise_for_status()
        with open(out, "wb") as f:
            for chunk in r.iter_content(1 << 20):
                f.write(chunk)
    print(f"wrote {out}  ({out.stat().st_size / 1e6:.1f} MB)")
    if args.save_json:
        js = out.with_suffix(".fal.json")
        js.write_text(json.dumps({"request_id": job["request_id"], "endpoint": endpoint,
                                  "duration": duration, "resolution": args.resolution,
                                  "image": args.image,
                                  "prompt": args.prompt,
                                  "negative_prompt": args.negative_prompt,
                                  "result": result}, indent=1),
                      encoding="utf-8")
        print(f"wrote {js}")


if __name__ == "__main__":
    main()
