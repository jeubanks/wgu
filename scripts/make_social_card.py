"""Draw docs/assets/social-card.png, the 1200x630 link-preview image for the site.

Run it by hand after changing the wording (it isn't part of the build):

    .venv/bin/pip install pillow
    .venv/bin/python scripts/make_social_card.py

The fonts are macOS's Arial; pass other .ttf paths with --font / --bold elsewhere.
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "docs" / "assets" / "social-card.png"
NAVY, MIDNIGHT, SKY, LIME, WHITE = "#002855", "#001731", "#46b1ef", "#97e152", "#ffffff"
FONTS = "/System/Library/Fonts/Supplemental/"


def disks(draw, x, y, s):
    """The favicon's stack of database disks, s pixels wide, top-left at (x, y)."""
    w, h, step, line = s, s * 0.38, s * 0.62, max(4, int(s / 16))
    for i, color in enumerate((SKY, SKY, LIME)):
        top = y + i * step
        draw.arc([x, top + step, x + w, top + step + h], 0, 180, fill=color, width=line)
        draw.line([x + line / 2, top + h / 2, x + line / 2, top + step + h / 2], fill=color, width=line)
        draw.line([x + w - line / 2, top + h / 2, x + w - line / 2, top + step + h / 2], fill=color, width=line)
    draw.ellipse([x, y, x + w, y + h], outline=SKY, width=line)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--font", default=FONTS + "Arial.ttf")
    ap.add_argument("--bold", default=FONTS + "Arial Bold.ttf")
    args = ap.parse_args()

    img = Image.new("RGB", (1200, 630), NAVY)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 560, 1200, 630], fill=MIDNIGHT)
    disks(d, 90, 150, 170)

    title = ImageFont.truetype(args.bold, 88)
    body = ImageFont.truetype(args.font, 38)
    small = ImageFont.truetype(args.font, 28)
    d.text((330, 150), "WGU Study Kits", font=title, fill=WHITE)
    d.text((332, 270), "D427 Data Management: 151 MySQL exercises,", font=body, fill=SKY)
    d.text((332, 320), "quizzes, diagrams, and SQL in your browser", font=body, fill=SKY)
    d.text((332, 400), "D949 Data Structures and Algorithms I", font=body, fill=WHITE)
    d.text((90, 580), "Unofficial study material  ·  jeubanks.github.io/wgu", font=small, fill=LIME)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, optimize=True)
    print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
