#!/usr/bin/env python3
"""
Generate DevFactory app icons in all formats required by electron-builder:
- icon.ico (Windows, multi-resolution: 16, 32, 48, 64, 128, 256)
- icon.icns (macOS)
- icon.png (Linux, 512x512)
- icon-512.png (extra)
- icon-1024.png (extra for retina)

The icon is a cyberpunk-style lightning bolt (Zap) on dark background,
matching the DevFactory brand.
"""

import os
from PIL import Image, ImageDraw, ImageFilter
import struct
import io

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "build")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# DevFactory brand colors
BG_COLOR = (5, 8, 17)        # #050811 (deep dark blue)
CYAN_COLOR = (0, 240, 255)   # #00f0ff (neon cyan)
RED_COLOR = (255, 51, 51)    # #ff3333 (holographic red)

def draw_icon(size: int) -> Image.Image:
    """Draw the DevFactory lightning bolt icon at the given size."""
    # Create transparent image with dark background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background: dark cyberpunk gradient (approximated)
    # Use a circle with dark color and subtle cyan border
    margin = max(1, size // 16)
    # Filled rounded square (background)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 6,
        fill=BG_COLOR + (255,),
    )

    # Cyan border
    border_width = max(1, size // 32)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 6,
        outline=CYAN_COLOR + (255,),
        width=border_width,
    )

    # Lightning bolt (Zap icon) — simplified geometric shape
    # Points based on the lucide-react Zap icon
    cx = size // 2
    cy = size // 2
    bolt_size = int(size * 0.55)

    # Zap polygon (cyan)
    points = [
        (cx + bolt_size * 0.15, cy - bolt_size * 0.5),  # top right
        (cx - bolt_size * 0.35, cy + bolt_size * 0.05),  # left middle
        (cx - bolt_size * 0.05, cy + bolt_size * 0.05),  # center bottom-left
        (cx - bolt_size * 0.15, cy + bolt_size * 0.5),   # bottom left
        (cx + bolt_size * 0.35, cy - bolt_size * 0.05),  # right middle
        (cx + bolt_size * 0.05, cy - bolt_size * 0.05),  # center top-right
    ]
    draw.polygon(points, fill=CYAN_COLOR + (255,))

    # Small red accent dot (top-right corner)
    dot_size = max(2, size // 16)
    draw.ellipse(
        [size - margin - dot_size * 3, margin + dot_size,
         size - margin - dot_size, margin + dot_size * 3],
        fill=RED_COLOR + (255,),
    )

    # Apply subtle glow effect (blur overlay)
    if size >= 64:
        glow = img.filter(ImageFilter.GaussianBlur(radius=max(1, size // 64)))
        # Composite: glow under original
        img = Image.alpha_composite(glow, img)

    return img


def save_png(sizes: list[int], basename: str):
    """Save PNG files at multiple sizes."""
    for size in sizes:
        img = draw_icon(size)
        path = os.path.join(OUTPUT_DIR, f"{basename}-{size}.png")
        img.save(path, "PNG")
        print(f"  ✓ {path} ({size}x{size})")


def save_png_single(size: int, basename: str):
    """Save a single PNG."""
    img = draw_icon(size)
    path = os.path.join(OUTPUT_DIR, f"{basename}.png")
    img.save(path, "PNG")
    print(f"  ✓ {path} ({size}x{size})")


def save_ico(sizes: list[int], basename: str):
    """Save Windows .ico file with multiple resolutions."""
    images = []
    for size in sizes:
        img = draw_icon(size)
        # ICO requires RGBA → RGB with transparency
        images.append(img)

    path = os.path.join(OUTPUT_DIR, f"{basename}.ico")
    # PIL supports writing multi-size ICO
    images[0].save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[1:],
    )
    print(f"  ✓ {path} (sizes: {sizes})")


def save_icns(sizes: list[int], basename: str):
    """Save macOS .icns file (best-effort, fallback to PNG if not supported)."""
    try:
        images = [draw_icon(s) for s in sizes]
        path = os.path.join(OUTPUT_DIR, f"{basename}.icns")
        images[0].save(
            path,
            format="ICNS",
            append_images=images[1:],
        )
        print(f"  ✓ {path} (sizes: {sizes})")
    except Exception as e:
        print(f"  ⚠ ICNS not supported ({e}), creating PNG fallback")
        # Fallback: save 512x512 PNG (electron-builder can use it)
        save_png_single(512, basename)


def main():
    print("🎨 Generating DevFactory app icons...")

    # ICO (Windows) — multi-resolution
    print("\n📦 Windows .ico:")
    save_ico([16, 32, 48, 64, 128, 256], "icon")

    # ICNS (macOS)
    print("\n🍎 macOS .icns:")
    save_icns([16, 32, 64, 128, 256, 512, 1024], "icon")

    # PNG (Linux) — single 512x512
    print("\n🐧 Linux .png:")
    save_png_single(512, "icon")

    # Extra PNGs for various uses
    print("\n📸 Extra PNGs:")
    save_png([16, 32, 64, 128, 256, 512, 1024], "icon")

    print("\n✅ All icons generated in:", OUTPUT_DIR)


if __name__ == "__main__":
    main()
