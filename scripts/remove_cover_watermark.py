#!/usr/bin/env python3
"""Remove the pale-red reading-only stamp from the cover raster."""

from pathlib import Path
import argparse

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("cover", type=Path)
    parser.add_argument("clean_certificate", type=Path)
    args = parser.parse_args()

    cover = Image.open(args.cover).convert("RGB")
    pixels = cover.load()
    for y in range(cover.height):
        for x in range(cover.width):
            red, green, blue = pixels[x, y]
            if red > 210 and green > 180 and blue > 180 and red > green and red > blue:
                pixels[x, y] = (255, 255, 255)

    certificate = Image.open(args.clean_certificate).convert("RGB")
    cover.paste(certificate, (289, 488))
    cover.save(args.cover, optimize=True)


if __name__ == "__main__":
    main()
