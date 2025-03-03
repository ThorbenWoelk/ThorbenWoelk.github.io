import os
import json
import tempfile
from pathlib import Path
import pytest
from unittest.mock import patch, MagicMock

# Import the modules to test
from src.scanner import Scanner
from src.image_processor import process_image
from config import SIZES, ORIGINAL_FORMATS, OUTPUT_FORMAT

# Import main.py functions
import sys

sys.path.append('.')
from main import write_js_list, find_base_path, process_collection


class TestEndToEnd:
    """End-to-end tests for the full pipeline."""

    @pytest.fixture
    def test_project(self):
        """Create a complete test project structure."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            # Create full directory structure
            images_dir = temp_path / 'images'
            images_dir.mkdir()

            processed_dir = temp_path / 'processed'
            processed_dir.mkdir()

            js_dir = temp_path / 'assets' / 'js'
            js_dir.mkdir(parents=True)

            # Create collections
            for collection in ['current', 'archive']:
                col_dir = images_dir / collection
                col_dir.mkdir()

                # Add some test images
                for i in range(2):
                    img_path = col_dir / f"test_{i}.jpg"
                    with open(img_path, 'wb') as f:
                        f.write(b'test image content')

            # Create a minimal config.py if it doesn't exist in the temp directory
            config_path = temp_path / 'config.py'
            if not os.path.exists('config.py'):
                config_content = """
from typing import Dict, Tuple

SIZES: Dict[str, Tuple[int, int]] = {
    'large': (2048, 1365),
    'grid': (1200, 800),
    'thumb': (600, 400)
}

QUALITY = 85
ORIGINAL_FORMATS = {'.jpg', '.jpeg', '.png'}
OUTPUT_FORMAT = '.webp'
"""
                config_path.write_text(config_content)

            yield temp_path

    @patch('src.image_processor.Image')
    def test_full_pipeline(self, mock_pil, test_project):
        """Test the full pipeline from scanning to JS generation."""
        # Configure the mock
        mock_img = MagicMock()
        mock_img.copy.return_value = mock_img
        mock_pil.open.return_value.__enter__.return_value = mock_img

        images_dir = test_project / 'images'

        # Create a scanner
        scanner = Scanner(images_dir)

        # Scan the collections
        collections = scanner.scan_all()

        # Process a collection - just process the current collection
        process_collection(images_dir / 'current', images_dir)

        # Generate the JS file
        write_js_list(collections, images_dir)

        # Verify the JS file was created
        js_file = test_project / 'assets' / 'js' / 'imageList.js'
        assert js_file.exists()

        # Check that the processed directories were created for 'current'
        # We only expect 'current' directories to exist since that's the only one we processed
        for size in SIZES.keys():
            size_dir = test_project / 'processed' / 'current' / size
            assert size_dir.exists(), f"Directory {size_dir} should exist"

        # Verify the content of the JS file
        content = js_file.read_text()
        assert 'export const imageCollections =' in content
        assert 'export const imageFiles =' in content
        assert 'current' in content
        assert 'archive' in content