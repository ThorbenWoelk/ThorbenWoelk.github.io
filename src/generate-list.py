#!/usr/bin/env python3
import os
import json
from pathlib import Path


def generate_image_list():
    images_path = Path('images')

    # Validate images directory
    if not images_path.exists():
        print(f"Error: {images_path} not found")
        return

    # Collect collections
    collections = {}
    for collection in images_path.iterdir():
        if collection.is_dir():
            images = [
                img.name for img in collection.iterdir()
                if img.suffix.lower() in {'.jpg', '.jpeg', '.png'}
            ]

            if images:
                collections[collection.name] = images
                print(f"{collection.name}: {len(images)} images")

    # Generate JavaScript export
    output_path = Path('assets/js/imageList.js')
    output_path.parent.mkdir(parents=True, exist_ok=True)

    js_content = f"export const imageCollections = {json.dumps(collections)};"
    output_path.write_text(js_content)

    print(f"Generated {output_path}")


def main():
    generate_image_list()


if __name__ == '__main__':
    main()