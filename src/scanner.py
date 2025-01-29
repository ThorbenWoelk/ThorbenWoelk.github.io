from pathlib import Path
from typing import Dict, List, Set, Tuple
import logging
from config import ORIGINAL_FORMATS, SIZES, OUTPUT_FORMAT


class Scanner:
    def __init__(self, images_path: Path):
        self.images_path = images_path
        self.processed_path = images_path.parent / 'processed'
        if not images_path.exists():
            raise FileNotFoundError(f"Images path not found: {images_path}")

    def get_processed_paths(self, collection: str) -> Dict[str, Set[Path]]:
        processed = {}
        for size in SIZES.keys():
            path = self.processed_path / collection / size
            if path.exists():
                processed[size] = {p for p in path.glob(f"*{OUTPUT_FORMAT}")}
            else:
                processed[size] = set()
        return processed

    def needs_processing(self, src: Path, collection: str) -> bool:
        processed = self.get_processed_paths(collection)

        for size in SIZES.keys():
            out_path = self.processed_path / collection / size / f"{src.stem}{OUTPUT_FORMAT}"
            if not out_path.exists():
                return True
            if out_path.stat().st_mtime < src.stat().st_mtime:
                return True
        return False

    def clean_orphaned(self, collection: str, valid_stems: Set[str]) -> None:
        processed = self.get_processed_paths(collection)
        for size_files in processed.values():
            for path in size_files:
                if path.stem not in valid_stems:
                    path.unlink()
                    logging.info(f"Removed orphaned: {path}")

    def scan_collection(self, collection: Path) -> Tuple[List[Path], Set[str]]:
        if not collection.is_dir():
            return [], set()

        originals = [
            f for f in collection.iterdir()
            if f.suffix.lower() in ORIGINAL_FORMATS
        ]

        to_process = [
            f for f in originals
            if self.needs_processing(f, collection.name)
        ]

        valid_stems = {f.stem for f in originals}
        self.clean_orphaned(collection.name, valid_stems)

        return to_process, valid_stems

    def scan_all(self) -> Dict[str, List[str]]:
        collections = {}

        for collection in self.images_path.iterdir():
            if not collection.is_dir():
                continue

            to_process, valid_stems = self.scan_collection(collection)

            if valid_stems:
                collections[collection.name] = [
                    f"{stem}{OUTPUT_FORMAT}" for stem in sorted(valid_stems)
                ]
                if to_process:
                    logging.info(f"{collection.name}: {len(to_process)} images need processing")

        return collections