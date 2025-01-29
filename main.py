#!/usr/bin/env python3
import os
import json
from pathlib import Path
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

def generate_image_collections():
    possible_paths = [
        Path.cwd() / 'images',
        Path(__file__).resolve().parent / 'images',
        Path(__file__).resolve().parent.parent / 'images'
    ]

    images_path = next((path for path in possible_paths if path.exists()), None)

    if not images_path:
        logging.error("No images directory found")
        return {}

    logging.info(f"Using images path: {images_path}")

    collections = {}
    for collection in images_path.iterdir():
        if collection.is_dir():
            images = [
                img.name for img in collection.rglob('*.jpg')
            ]

            if images:
                collections[collection.name] = sorted(images)
                logging.info(f"{collection.name}: {len(images)} images")

    return collections, images_path

def cleanup_artifacts(source_dir, artifact_dirs):
    """Remove image artifacts no longer present in source directory"""
    source_images = {f.name for f in source_dir.rglob('*.jpg')}

    for artifact_dir in artifact_dirs:
        artifact_dir.mkdir(parents=True, exist_ok=True)
        for artifact in artifact_dir.glob('*.jpg'):
            if artifact.name not in source_images:
                logging.info(f"DELETE: Removing orphaned {artifact.name}")
                artifact.unlink()

def process_artifacts(source_dir):
    artifact_dirs = [
        Path(__file__).resolve().parent / 'assets' / 'images' / 'large',
        Path(__file__).resolve().parent / 'assets' / 'images' / 'grid',
        Path(__file__).resolve().parent / 'assets' / 'images' / 'thumb'
    ]
    cleanup_artifacts(source_dir, artifact_dirs)

def write_js_list(collections):
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