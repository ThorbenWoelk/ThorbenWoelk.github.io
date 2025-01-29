#!/usr/bin/env python3
import json
import logging
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from src.scanner import Scanner
from src.image_processor import process_image


def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s: %(message)s',
        handlers=[logging.StreamHandler(sys.stdout)]
    )


def find_base_path() -> Optional[Path]:
    """Locate images directory."""
    possible_paths = [
        Path.cwd() / 'images',
        Path(__file__).resolve().parent / 'images',
    ]
    return next((p for p in possible_paths if p.exists()), None)


def write_js_list(collections: dict, output_dir: Path):
    """Generate JavaScript export of image collections."""
    output_path = output_dir / 'assets' / 'js' / 'imageList.js'
    output_path.parent.mkdir(parents=True, exist_ok=True)

    js_content = [
        f"export const imageCollections = {json.dumps(collections, indent=2)};",
        f"export const imageFiles = {json.dumps(sorted([img for imgs in collections.values() for img in imgs]))}"
    ]

    output_path.write_text('\n'.join(js_content))
    logging.info(f"Generated {output_path}")


def process_collection(collection: Path, base_path: Path):
    """Process all images in a collection."""
    scanner = Scanner(base_path)
    to_process, _ = scanner.scan_collection(collection)

    for image in to_process:
        process_image(image, collection.name, base_path)


def main():
    setup_logging()
    base_path = find_base_path()

    if not base_path:
        logging.error("No images directory found")
        return

    scanner = Scanner(base_path)
    collections = scanner.scan_all()

    with ThreadPoolExecutor() as executor:
        futures = [
            executor.submit(process_collection, Path(base_path / col), base_path)
            for col in collections.keys()
        ]
        for future in futures:
            future.result()

    write_js_list(collections, base_path.parent)


if __name__ == '__main__':
    main()