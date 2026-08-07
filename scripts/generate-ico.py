#!/usr/bin/env python3
"""Generate proper multi-resolution ICO for Windows."""

import os
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "desktop", "build")
os.makedirs(OUTPUT_DIR, exist_ok=True)

BG_COLOR = (5, 8, 17)
CYAN_COLOR = (0, 240, 255)
RED_COLOR = (255, 51, 51)

def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    margin = max(1, size // 16)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 6,
        fill=BG_COLOR + (255,),
    )
    border_width = max(1, size // 32)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 6,
        outline=CYAN_COLOR + (255,),
        width=border_width,
    )
    cx = size // 2
    cy = size // 2
    bolt_size = int(size * 0.55)
    points = [
        (cx + bolt_size * 0.15, cy - bolt_size * 0.5),
        (cx - bolt_size * 0.35, cy + bolt_size * 0.05),
        (cx - bolt_size * 0.05, cy + bolt_size * 0.05),
        (cx - bolt_size * 0.15, cy + bolt_size * 0.5),
        (cx + bolt_size * 0.35, cy - bolt_size * 0.05),
        (cx + bolt_size * 0.05, cy - bolt_size * 0.05),
    ]
    draw.polygon(points, fill=CYAN_COLOR + (255,))
    dot_size = max(2, size // 16)
    draw.ellipse(
        [size - margin - dot_size * 3, margin + dot_size,
         size - margin - dot_size, margin + dot_size * 3],
        fill=RED_COLOR + (255,),
    )
    return img


def main():
    print("🎨 Generating proper multi-resolution ICO...")
    sizes = [16, 32, 48, 64, 128, 256]
    images = [draw_icon(s) for s in sizes]

    # Save ICO properly — first image is the base, others appended
    ico_path = os.path.join(OUTPUT_DIR, "icon.ico")
    images[0].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:],
    )
    print(f"  ✓ {ico_path}")

    # Verify
    img = Image.open(ico_path)
    print(f"  ICO sizes: {img.info.get('sizes', 'unknown')}")

    # Also save PNG 512 (Linux)
    png_path = os.path.join(OUTPUT_DIR, "icon.png")
    draw_icon(512).save(png_path, "PNG")
    print(f"  ✓ {png_path} (512x512)")

    # ICNS (macOS)
    try:
        icns_path = os.path.join(OUTPUT_DIR, "icon.icns")
        icns_images = [draw_icon(s) for s in [16, 32, 64, 128, 256, 512, 1024]]
        icns_images[0].save(
            icns_path,
            format="ICNS",
            append_images=icns_images[1:],
        )
        print(f"  ✓ {icns_path}")
    except Exception as e:
        print(f"  ⚠ ICNS failed: {e}")


if __name__ == "__main__":
    main()
