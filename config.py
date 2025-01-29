from typing import Dict, Tuple

SIZES: Dict[str, Tuple[int, int]] = {
    'large': (2048, 1365),
    'grid': (1200, 800),
    'thumb': (600, 400)
}

QUALITY = 85
ORIGINAL_FORMATS = {'.jpg', '.jpeg', '.png'}
OUTPUT_FORMAT = '.webp'