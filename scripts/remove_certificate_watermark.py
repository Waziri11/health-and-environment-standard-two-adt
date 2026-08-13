#!/usr/bin/env python3
"""Remove the orange diagonal reading-only stamp from the certificate image."""

from pathlib import Path
import argparse

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("target", type=Path)
    parser.add_argument("clean_reference", type=Path)
    args = parser.parse_args()

    target = Image.open(args.target).convert("RGB")
    reference = Image.open(args.clean_reference).convert("RGB").resize(target.size, Image.Resampling.LANCZOS)

    # Both certificates use the same official template. Start from the clean
    # template, then restore only the three book-specific printed fields.
    cleaned = reference.copy()
    for box in (
        (370, 275, 465, 310),  # certificate number
        (155, 350, 495, 390),  # publication title
        (155, 435, 355, 475),  # ISBN
    ):
        cleaned.paste(target.crop(box), box)
    cleaned.save(args.target, optimize=True)


if __name__ == "__main__":
    main()
