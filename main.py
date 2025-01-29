#!/usr/bin/env python3
import os
import json
from pathlib import Path
import logging
import sys
from PIL import Image

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)


def optimize_image(image_path, output_dirs):
    filename = Path(image_path).name

    sizes = [
        (2048, 1365, 'large'),
        (1200, 800, 'grid'),
        (600, 400, 'thumb')
    ]

    with Image.open(image_path) as img:
        for width, height, suffix in sizes:
            output_dir = Path(output_dirs[suffix])
            output_dir.mkdir(parents=True, exist_ok=True)
            output_path = output_dir / filename

            img.copy().thumbnail((width, height), Image.LANCZOS)
            img.save(
                output_path,
                quality=85,
                optimize=True
            )

    return filename


def generate_image_collections():
    possible_paths = [
        Path.cwd() / 'images',
        Path(__file__).resolve().parent / 'images',
        Path(__file__).resolve().parent.parent / 'images'
    ]

    images_path = next((path for path in possible_paths if path.exists()), None)

    if not images_path:
        logging.error("No images directory found")
        return {}, None

    logging.info(f"Using images path: {images_path}")

    collections = {}
    for collection in images_path.iterdir():
        if collection.is_dir():
            images = []
            for img_path in collection.rglob('*.jpg'):
                if img_path.exists() and img_path.stat().st_size:
                    images.append(img_path.name)
                else:
                    logging.warning(f"Invalid or empty file: {img_path}")

            if images:
                collections[collection.name] = sorted(images)
                logging.info(f"{collection.name}: {len(images)} valid images")
            else:
                logging.warning(f"No valid images in {collection.name}")

    return collections, images_path


def process_artifacts(source_dir):
    if not source_dir:
        logging.error("No source directory provided for processing")
        return

    artifact_dirs = [
        Path(__file__).resolve().parent / 'processed' / 'images' / 'large',
        Path(__file__).resolve().parent / 'processed' / 'images' / 'grid',
        Path(__file__).resolve().parent / 'processed' / 'images' / 'thumb'
    ]

    # Create mapping of valid source images
    source_images = {}
    for collection in source_dir.iterdir():
        if collection.is_dir():
            for img_path in collection.rglob('*.jpg'):
                if img_path.exists() and img_path.stat().st_size:
                    source_images[img_path.name] = img_path

    logging.info(f"Found {len(source_images)} valid source images")

    # Process new or modified images
    for img_name, img_path in source_images.items():
        needs_processing = False
        for dir in artifact_dirs:
            processed_path = dir / img_name
            if not processed_path.exists():
                needs_processing = True
                break
            if processed_path.stat().st_mtime < img_path.stat().st_mtime:
                needs_processing = True
                break

        if needs_processing:
            logging.info(f"Processing image: {img_name}")
            optimize_image(str(img_path), {
                'large': str(artifact_dirs[0]),
                'grid': str(artifact_dirs[1]),
                'thumb': str(artifact_dirs[2])
            })

    # Remove orphaned processed images
    for dir in artifact_dirs:
        if not dir.exists():
            continue
        for artifact in dir.glob('*.jpg'):
            if artifact.name not in source_images:
                logging.info(f"DELETE: Removing orphaned {artifact}")
                artifact.unlink()


def write_js_list(collections):
    if not collections:
        logging.warning("No collections to write")
        return

    output_path = Path(__file__).resolve().parent / 'assets' / 'js' / 'imageList.js'
    output_path.parent.mkdir(parents=True, exist_ok=True)

    js_content = f"export const imageCollections = {json.dumps(collections, indent=2)};\n"
    js_content += f"export const imageFiles = {json.dumps(sorted([img for collection in collections.values() for img in collection]))}"

    output_path.write_text(js_content)
    logging.info(f"Generated {output_path}")


def main():
    collections, source_dir = generate_image_collections()
    process_artifacts(source_dir)
    write_js_list(collections)


if __name__ == '__main__':
    main()