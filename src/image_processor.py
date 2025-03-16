from pathlib import Path
from PIL import Image, ImageOps
from typing import Dict
import logging
from config import SIZES, QUALITY, OUTPUT_FORMAT


def create_dirs(base_path: Path, collection: str) -> Dict[str, Path]:
    processed_path = base_path.parent / 'processed'
    dirs = {}
    for size in SIZES.keys():
        path = processed_path / collection / size
        path.mkdir(parents=True, exist_ok=True)
        dirs[size] = path
    return dirs

def process_image(src_path: Path, collection: str, base_path: Path) -> None:
    output_dirs = create_dirs(base_path, collection)

    try:
        with Image.open(src_path) as img:
            # Apply EXIF orientation
            img = ImageOps.exif_transpose(img)

            for size_name, (width, height) in SIZES.items():
                out_path = output_dirs[size_name] / f"{src_path.stem}{OUTPUT_FORMAT}"

                if out_path.exists() and out_path.stat().st_mtime > src_path.stat().st_mtime:
                    continue

                img_copy = img.copy()
                img_copy.thumbnail((width, height), Image.LANCZOS)
                img_copy.save(
                    out_path,
                    format="WEBP",
                    quality=QUALITY,
                    optimize=True
                )
                logging.info(f"Processed: {out_path}")

    except Exception as e:
        logging.error(f"Failed to process {src_path}: {e}")
        raise