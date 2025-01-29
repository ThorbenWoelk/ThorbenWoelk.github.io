#!/usr/bin/env python3
import sys
import os
from pathlib import Path
from PIL import Image
import magic


def optimize_image(image_path, output_dirs):
    filename = Path(image_path).name

    # Ensure output directories exist
    for directory in output_dirs:
        os.makedirs(directory, exist_ok=True)

    # Image processing configurations
    sizes = [
        (2048, 1365, 'large'),
        (1200, 800, 'grid'),
        (600, 400, 'thumb')
    ]

    with Image.open(image_path) as img:
        for width, height, suffix in sizes:
            output_path = os.path.join(output_dirs[suffix], filename)
            img.copy().thumbnail((width, height), Image.LANCZOS).save(
                output_path,
                quality=85,
                optimize=True
            )

    return filename


def main():
    if len(sys.argv) < 2:
        print("Usage: python optimize.py <image_path>")
        sys.exit(1)

    root_path = Path(__file__).parent.parent
    image_path = sys.argv[1]

    output_dirs = {
        'large': root_path / 'assets' / 'images' / 'large',
        'grid': root_path / 'assets' / 'images' / 'grid',
        'thumb': root_path / 'assets' / 'images' / 'thumb'
    }

    try:
        filename = optimize_image(image_path, {k: str(v) for k, v in output_dirs.items()})
        print(f"Processed {filename}")
    except Exception as e:
        print(f"Error processing image: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()