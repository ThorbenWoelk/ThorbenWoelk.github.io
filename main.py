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

    for p in possible_paths:
        if p.exists():
            logging.info(f"Found images directory at: {p}")
            return p

    logging.error("No images directory found in: %s", [str(p) for p in possible_paths])
    return None


def write_js_list(collections: dict, base_path: Path):
    """Generate JavaScript export of image collections."""
    # Make sure we're writing to the right location relative to the repo root
    repo_root = base_path.parent
    output_path = repo_root / 'assets' / 'js' / 'imageList.js'
    output_path.parent.mkdir(parents=True, exist_ok=True)

    logging.info(f"Writing image collections to: {output_path}")

    # Build all image files list from collections
    all_files = sorted([img for imgs in collections.values() for img in imgs])

    js_content = [
        f"export const imageCollections = {json.dumps(collections, indent=2)};",
        f"export const imageFiles = {json.dumps(all_files)}"
    ]

    # Write to file with explicit encoding
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(js_content))

    logging.info(f"Generated {output_path} with {len(all_files)} total images")
    for collection, images in collections.items():
        logging.info(f"  - {collection}: {len(images)} images")


def process_collection(collection: Path, base_path: Path):
    """Process all images in a collection."""
    scanner = Scanner(base_path)
    to_process, _ = scanner.scan_collection(collection)

    logging.info(f"Processing {len(to_process)} images in {collection.name}")

    for image in to_process:
        process_image(image, collection.name, base_path)


def main():
    setup_logging()
    logging.info("Starting image processing")

    base_path = find_base_path()
    if not base_path:
        logging.error("No images directory found")
        return

    scanner = Scanner(base_path)
    collections = scanner.scan_all()

    if not collections:
        logging.warning("No image collections found. Check your images directory structure.")
        return

    logging.info(f"Found {len(collections)} collections: {', '.join(collections.keys())}")

    with ThreadPoolExecutor() as executor:
        futures = [
            executor.submit(process_collection, Path(base_path / col), base_path)
            for col in collections.keys()
        ]
        for future in futures:
            future.result()

    write_js_list(collections, base_path)
    logging.info("Image processing completed successfully")


if __name__ == '__main__':
    main()