#!/usr/bin/env python3
"""
composite_logo.py — paste a REAL logo onto a rendered thumbnail as a layer.

Why this exists: gen_thumbnail.py passes a logo PNG to Gemini as a *reference
image*, so the model redraws it from scratch every roll. Petal counts drift,
brand colour shifts, brightness is a lottery. For a fixed vector asset that is
the wrong tool — you want the actual file, pixel-exact.

This paints out the model's drawn version with a feathered patch (works when the
backdrop there is near-black, which the dark-studio environment gives you), then
composites the real logo with a controlled multi-radius bloom so it reads as a
light source rather than a flat sticker.

Usage:
  python tools/composite_logo.py \
      --base videos/video-1/packaging/thumbs/A3-v3.png \
      --logo media/library/logos/claude-1024.png \
      --out  videos/video-1/packaging/thumbs/A3.png \
      --clear-box 170,455,1105,1465 --center 679,965 --size 940 --jpg

Options:
  --base PATH          rendered plate to composite onto (required)
  --logo PATH          logo image; a white background is keyed out automatically
  --out PATH           output .png (required)
  --clear-box L,T,R,B  region of the model-drawn logo to paint out (omit to skip)
  --feather N          patch edge blur, default 34
  --bg R,G,B           patch fill; default 4,5,6 (sample your own backdrop)
  --center X,Y         where to place the real logo, default = clear-box centre
  --size N             logo bounding size in px, default 940
  --core R,G,B         logo fill colour, default 247,130,74 (lifted Claude terracotta)
  --glow R,G,B         bloom colour, default 255,120,60
  --no-glow            skip the bloom entirely
  --jpg                also write a YouTube-spec JPG next to the PNG

App-icon tile mode (--tile): draws the mark knocked out of a solid rounded square
instead of bare. A bare starburst fills only ~22% of its bounding box, so it
dissolves at browse size; a tile fills ~95% and holds its mass. --size becomes the
tile's edge length.
  --tile               enable tile mode
  --tile-color R,G,B   tile fill, default 217,119,87 (Claude terracotta)
  --mark-color R,G,B   knocked-out mark, default 250,243,236 (warm cream)
  --tile-radius PCT    corner radius as % of edge, default 23
  --mark-scale PCT     mark size as % of edge, default 62

Find --clear-box by probing the plate: the drawn logo is a dense mass of
red-dominant pixels, while cables/faces are sparse or sit elsewhere.
"""
import os
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

GLOW_LAYERS = [(28, 0.85), (70, 0.70), (170, 0.55), (320, 0.32)]  # (blur px, strength)


def get_arg(argv, flag, default=None):
    return argv[argv.index(flag) + 1] if flag in argv else default


def ints(s, n):
    parts = [int(v) for v in s.split(",")]
    if len(parts) != n:
        sys.exit(f"expected {n} comma-separated ints, got {s!r}")
    return tuple(parts)


def key_out_white(path, size):
    """Alpha from distance-to-white; works for a flat 2-colour logo on white."""
    src = Image.open(path)
    if src.mode in ("RGBA", "LA"):
        alpha = src.getchannel("A")
    else:
        r, g, b = src.convert("RGB").split()
        darkest = ImageChops.darker(ImageChops.darker(r, g), b)
        # the flat terracotta bottoms out around B=87; white is 255
        alpha = darkest.point(lambda v: max(0, min(255, int((255 - v) * 255 / 168))))
    box = alpha.getbbox()
    if box:
        alpha = alpha.crop(box)                     # trim the file's margin
    return alpha.resize((size, size), Image.LANCZOS)


def scale_rgb(rgb, f):
    return tuple(max(0, min(255, int(c * f))) for c in rgb)


def make_tile(size, radius_pct, tile_rgb, mark_alpha, mark_rgb, mark_scale_pct):
    """Rounded-square app icon with the logo knocked out of it, as RGBA."""
    # subtle top-to-bottom gradient so the tile reads as a lit surface, not vinyl
    top, bottom = scale_rgb(tile_rgb, 1.07), scale_rgb(tile_rgb, 0.86)
    grad = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / max(1, size - 1)
        grad.putpixel(
            (0, y), tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        )
    grad = grad.resize((size, size))

    shape = Image.new("L", (size, size), 0)
    radius = int(size * radius_pct / 100)
    draw = ImageDraw.Draw(shape)
    if hasattr(draw, "rounded_rectangle"):
        draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    else:                                    # very old Pillow
        draw.rectangle([0, 0, size - 1, size - 1], fill=255)

    tile = grad.convert("RGBA")
    tile.putalpha(shape)

    ms = int(size * mark_scale_pct / 100)
    mark = mark_alpha.resize((ms, ms), Image.LANCZOS)
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    layer.paste(Image.new("RGBA", (ms, ms), mark_rgb + (255,)),
                ((size - ms) // 2, (size - ms) // 2), mark)
    return Image.alpha_composite(tile, layer)


def main(argv):
    base_p = get_arg(argv, "--base")
    logo_p = get_arg(argv, "--logo")
    out_p = get_arg(argv, "--out")
    if not (base_p and logo_p and out_p):
        sys.exit("need --base, --logo and --out. See --help in the file header.")

    feather = int(get_arg(argv, "--feather", 34))
    bg = ints(get_arg(argv, "--bg", "4,5,6"), 3)
    size = int(get_arg(argv, "--size", 940))
    core_rgb = ints(get_arg(argv, "--core", "247,130,74"), 3)
    glow_rgb = ints(get_arg(argv, "--glow", "255,120,60"), 3)

    base = Image.open(base_p).convert("RGB")
    W, H = base.size

    clear = get_arg(argv, "--clear-box")
    if clear:
        box = ints(clear, 4)
        mask = Image.new("L", (W, H), 0)
        ImageDraw.Draw(mask).rectangle(box, fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(feather))
        base = Image.composite(Image.new("RGB", (W, H), bg), base, mask)
        default_center = ((box[0] + box[2]) // 2, (box[1] + box[3]) // 2)
    else:
        default_center = (W // 2, H // 2)

    cx, cy = ints(get_arg(argv, "--center", "%d,%d" % default_center), 2)

    alpha = key_out_white(logo_p, size)

    if "--tile" in argv:
        sprite = make_tile(
            size,
            float(get_arg(argv, "--tile-radius", 23)),
            ints(get_arg(argv, "--tile-color", "217,119,87"), 3),
            alpha,
            ints(get_arg(argv, "--mark-color", "250,243,236"), 3),
            float(get_arg(argv, "--mark-scale", 62)),
        )
    else:
        sprite = None

    lw, lh = (sprite.size if sprite else alpha.size)
    ox, oy = cx - lw // 2, cy - lh // 2
    full_alpha = Image.new("L", (W, H), 0)
    full_alpha.paste(sprite.getchannel("A") if sprite else alpha, (ox, oy))

    if "--no-glow" not in argv:
        bloom = Image.new("RGB", (W, H), (0, 0, 0))
        for radius, strength in GLOW_LAYERS:
            blurred = full_alpha.filter(ImageFilter.GaussianBlur(radius))
            blurred = blurred.point(lambda v, s=strength: int(v * s))
            layer = Image.new("RGB", (W, H), (0, 0, 0))
            layer.paste(Image.new("RGB", (W, H), glow_rgb), (0, 0), blurred)
            bloom = ImageChops.screen(bloom, layer)
        base = ImageChops.screen(base, bloom)       # screen over black is a no-op

    if sprite is not None:
        base.paste(sprite.convert("RGB"), (ox, oy), sprite.getchannel("A"))
    else:
        # solid mark on top, with a soft hot centre so it doesn't read as flat vinyl
        core = Image.new("RGB", (W, H), core_rgb)
        hot = Image.new("L", (W, H), 0)
        ImageDraw.Draw(hot).ellipse(
            [cx - lw // 5, cy - lh // 5, cx + lw // 5, cy + lh // 5], fill=90
        )
        hot = hot.filter(ImageFilter.GaussianBlur(120))
        core = ImageChops.screen(core, Image.merge("RGB", (hot, hot, hot)))
        base.paste(core, (0, 0), full_alpha)

    os.makedirs(os.path.dirname(os.path.abspath(out_p)) or ".", exist_ok=True)
    base.save(out_p)
    print("png  ->", out_p)
    if "--jpg" in argv:
        jpg = os.path.splitext(out_p)[0] + ".jpg"
        base.save(jpg, "JPEG", quality=95)
        print("jpg  ->", jpg, f"({base.width}x{base.height}, {os.path.getsize(jpg)//1024}KB)")


if __name__ == "__main__":
    main(sys.argv[1:])
