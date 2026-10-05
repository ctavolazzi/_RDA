#!/usr/bin/env python3
"""
thumb_scrim.py — deepen the dark scrim behind a thumbnail headline, in post.

Why this exists: a scrim is a GRAPHIC overlay, not photography, and the image model
treats it as a suggestion. On D4 the rendered scrim plateaued around 50/255 no matter
how the prompt was worded, leaving the headline at ~3:1 against it — short of the 4:1
a headline needs. Darkening it deterministically hits any ratio exactly.

The headline itself is protected: saturated fill pixels (the coloured letters) are
excluded from the darkening, so only the ground behind them goes down.

Usage:
  python tools/thumb_scrim.py --in  videos/video-1/packaging/thumbs/D4.png \
                              --out videos/video-1/packaging/thumbs/D4.png \
                              --fade-y 620 --x-hold 1300 --x-fade 1700 \
                              --strength 0.55 --jpg

Options:
  --in PATH            source image (required)
  --out PATH           destination .png (required; may equal --in)
  --strength F         max darkening at the top edge, 0..1 (default 0.55)
  --fade-y N           scrim reaches zero at this row (default 40% of height)
  --x-hold N           full strength left of this column (default 55% of width)
  --x-fade N           zero strength right of this column — keeps a face on the
                       right side out of the scrim (default 75% of width)
  --hue H              protected headline hue in degrees: 120 green (default),
                       55 yellow, 0 red. Set --protect none to darken everything.
  --protect none       do not protect any lettering
  --jpg                also write a YouTube-spec JPG next to the PNG
"""
import colorsys
import os
import sys

from PIL import Image, ImageFilter


def get_arg(argv, flag, default=None):
    return argv[argv.index(flag) + 1] if flag in argv else default


def smoothstep(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


def main(argv):
    src_p, out_p = get_arg(argv, "--in"), get_arg(argv, "--out")
    if not (src_p and out_p):
        sys.exit("need --in and --out. See --help in the file header.")

    im = Image.open(src_p).convert("RGB")
    W, H = im.size

    strength = float(get_arg(argv, "--strength", 0.55))
    fade_y = int(get_arg(argv, "--fade-y", H * 0.40))
    x_hold = int(get_arg(argv, "--x-hold", W * 0.55))
    x_fade = int(get_arg(argv, "--x-fade", W * 0.75))
    protect = get_arg(argv, "--protect", "hue")
    hue = float(get_arg(argv, "--hue", 120))

    # --- build the scrim alpha: vertical falloff x horizontal falloff
    alpha = Image.new("L", (W, H), 0)
    ap = alpha.load()
    col = []
    for x in range(W):
        if x <= x_hold:
            col.append(1.0)
        elif x >= x_fade:
            col.append(0.0)
        else:
            col.append(1.0 - smoothstep((x - x_hold) / max(1, x_fade - x_hold)))
    for y in range(H):
        v = 0.0 if y >= fade_y else 1.0 - smoothstep(y / max(1, fade_y))
        if v <= 0:
            continue
        for x in range(W):
            a = v * col[x]
            if a > 0:
                ap[x, y] = int(a * 255)

    # --- protect the headline fill so only the ground darkens
    if protect != "none":
        keep = Image.new("L", (W, H), 0)
        kp = keep.load()
        sp = im.load()
        for y in range(0, fade_y):
            for x in range(0, x_fade):
                r, g, b = sp[x, y]
                h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
                if s > 0.45 and v > 0.45 and abs((h * 360) - hue) < 40:
                    kp[x, y] = 255
        keep = keep.filter(ImageFilter.MaxFilter(5))          # cover the anti-aliased rim
        keep = keep.filter(ImageFilter.GaussianBlur(2))
        kp = keep.load()
        for y in range(0, fade_y):
            for x in range(0, x_fade):
                if kp[x, y]:
                    ap[x, y] = int(ap[x, y] * (1 - kp[x, y] / 255))

    alpha = alpha.filter(ImageFilter.GaussianBlur(3))

    # --- multiply the ground down
    dark = Image.new("RGB", (W, H), (0, 0, 0))
    scaled = alpha.point(lambda v: int(v * strength))
    im = Image.composite(dark, im, scaled)

    im.save(out_p)
    print("png  ->", out_p)
    if "--jpg" in argv:
        jpg = os.path.splitext(out_p)[0] + ".jpg"
        im.save(jpg, "JPEG", quality=95)
        print("jpg  ->", jpg, f"({W}x{H}, {os.path.getsize(jpg)//1024}KB)")


if __name__ == "__main__":
    main(sys.argv[1:])
