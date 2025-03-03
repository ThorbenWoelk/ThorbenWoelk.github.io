#!/usr/bin/env python3
"""
Extract metadata from original image files and save it as a JSON file for website use.

This script reads EXIF data from original images in the images directory and stores
the relevant photography information like camera settings, lens information, etc.
"""
import json
import logging
import os
import sys
from pathlib import Path
import subprocess
from typing import Dict, List, Optional, Any
import piexif
from PIL import Image
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

# EXIF tag mappings - these help translate the numeric EXIF tags to human-readable names
# For example, '0x010f' in EXIF is the camera maker
EXIF_TAGS = {
    'Make': '0x010f',
    'Model': '0x0110',
    'FNumber': '0x829d',
    'ExposureTime': '0x829a',
    'ISOSpeedRatings': '0x8827',
    'ExposureBiasValue': '0x9204',
    'FocalLength': '0x920a',
    'FocalLengthIn35mmFilm': '0xa405',
    'LensModel': '0xa434',
    'DateTimeOriginal': '0x9003',
    'Flash': '0x9209',
    'MeteringMode': '0x9207',
    'ExposureProgram': '0x8822',
    'WhiteBalance': '0xa403',
}

# Map numeric values to human-readable strings for certain EXIF fields
METERING_MODES = {
    0: 'Unknown',
    1: 'Average',
    2: 'Center-weighted average',
    3: 'Spot',
    4: 'Multi-spot',
    5: 'Pattern',
    6: 'Partial',
    255: 'Other'
}

EXPOSURE_PROGRAMS = {
    0: 'Not defined',
    1: 'Manual',
    2: 'Normal program',
    3: 'Aperture priority',
    4: 'Shutter priority',
    5: 'Creative program',
    6: 'Action program',
    7: 'Portrait mode',
    8: 'Landscape mode'
}

FLASH_MODES = {
    0x0000: 'No Flash',
    0x0001: 'Flash Fired',
    0x0005: 'Flash Fired, Return not detected',
    0x0007: 'Flash Fired, Return detected',
    0x0008: 'On, Flash did not fire',
    0x0009: 'On, Flash fired',
    0x000D: 'On, Return not detected',
    0x000F: 'On, Return detected',
    0x0010: 'Off, Flash did not fire',
    0x0018: 'Auto, Flash did not fire',
    0x0019: 'Auto, Flash fired',
    0x001D: 'Auto, Return not detected',
    0x001F: 'Auto, Return detected',
    0x0020: 'No flash function',
    0x0041: 'Red-eye reduction',
    0x0045: 'Red-eye reduction, Return not detected',
    0x0047: 'Red-eye reduction, Return detected',
    0x0049: 'Red-eye reduction, On',
    0x004D: 'Red-eye reduction, On, Return not detected',
    0x004F: 'Red-eye reduction, On, Return detected',
    0x0058: 'Red-eye reduction, Auto, Did not fire',
    0x0059: 'Red-eye reduction, Auto, Fired',
    0x005D: 'Red-eye reduction, Auto, Return not detected',
    0x005F: 'Red-eye reduction, Auto, Return detected'
}

WHITE_BALANCE = {
    0: 'Auto',
    1: 'Manual'
}


def find_base_path() -> Optional[Path]:
    """Locate images directory."""
    possible_paths = [
        Path.cwd() / 'images',
        Path(__file__).resolve().parent.parent / 'images',
    ]

    for p in possible_paths:
        if p.exists():
            logging.info(f"Found images directory at: {p}")
            return p

    logging.error("No images directory found in: %s", [str(p) for p in possible_paths])
    return None


def get_exiftool_path() -> Optional[str]:
    """
    Find the ExifTool executable path.
    This is a more reliable way to extract metadata than Pillow/piexif alone.
    """
    # Try to find exiftool in PATH
    try:
        # On Windows
        if os.name == 'nt':
            result = subprocess.run(['where', 'exiftool'],
                                    capture_output=True, text=True, check=False)
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip().split('\n')[0]
        # On Linux/Mac
        else:
            result = subprocess.run(['which', 'exiftool'],
                                    capture_output=True, text=True, check=False)
            if result.returncode == 0 and result.stdout.strip():
                return result.stdout.strip()
    except (subprocess.SubprocessError, FileNotFoundError):
        logging.warning("ExifTool not found in PATH")

    # Common installation locations
    common_locations = []
    if os.name == 'nt':  # Windows
        common_locations = [
            r'C:\Program Files\ExifTool\exiftool.exe',
            r'C:\Program Files (x86)\ExifTool\exiftool.exe'
        ]
    else:  # Linux/Mac
        common_locations = [
            '/usr/bin/exiftool',
            '/usr/local/bin/exiftool',
            '/opt/local/bin/exiftool'
        ]

    for loc in common_locations:
        if os.path.isfile(loc):
            return loc

    return None


def test_exiftool(exiftool_path: str) -> bool:
    """Test if ExifTool is working correctly."""
    if not exiftool_path:
        return False

    try:
        # Run a simple test command
        cmd = [exiftool_path, '-ver']
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)

        if result.returncode == 0:
            logging.info(f"ExifTool test successful: version {result.stdout.strip()}")
            return True
        else:
            logging.error(f"ExifTool test failed: {result.stderr.strip()}")
            return False
    except Exception as e:
        logging.error(f"Error testing ExifTool: {e}")
        return False


def extract_metadata_pillow(image_path: Path) -> Dict[str, Any]:
    """
    Extract metadata using Pillow/piexif.
    This is a fallback if ExifTool is not available.
    """
    metadata = {}

    try:
        with Image.open(image_path) as img:
            # Extract basic image properties
            metadata['Width'] = img.width
            metadata['Height'] = img.height
            metadata['Format'] = img.format
            metadata['Filename'] = image_path.name

            # Extract EXIF data if available
            if 'exif' in img.info:
                try:
                    exif_data = piexif.load(img.info['exif'])

                    # Extract camera info
                    if '0x010f' in exif_data['0th']:  # Make
                        make = exif_data['0th']['0x010f'].decode('utf-8', errors='replace').strip('\x00')
                        metadata['Make'] = make

                    if '0x0110' in exif_data['0th']:  # Model
                        model = exif_data['0th']['0x0110'].decode('utf-8', errors='replace').strip('\x00')
                        metadata['Model'] = model

                    # Extract exposure info
                    if '0x829d' in exif_data['Exif']:  # FNumber
                        num, den = exif_data['Exif']['0x829d']
                        if den != 0:
                            metadata['FNumber'] = f"f/{num / den:.1f}".rstrip('0').rstrip('.')

                    if '0x829a' in exif_data['Exif']:  # ExposureTime
                        num, den = exif_data['Exif']['0x829a']
                        if den != 0:
                            val = num / den
                            if val >= 1:
                                metadata['ExposureTime'] = f"{val:.1f} sec".rstrip('0').rstrip('.')
                            else:
                                metadata['ExposureTime'] = f"1/{den / num:.0f} sec"

                    if '0x8827' in exif_data['Exif']:  # ISO
                        iso = exif_data['Exif']['0x8827']
                        if isinstance(iso, tuple):
                            metadata['ISO'] = f"ISO-{iso[0]}"
                        else:
                            metadata['ISO'] = f"ISO-{iso}"

                    if '0x9204' in exif_data['Exif']:  # ExposureBiasValue
                        num, den = exif_data['Exif']['0x9204']
                        if den != 0:
                            metadata['ExposureBias'] = f"{num / den:+.1f} EV".rstrip('0').rstrip('.')

                    if '0x920a' in exif_data['Exif']:  # FocalLength
                        num, den = exif_data['Exif']['0x920a']
                        if den != 0:
                            metadata['FocalLength'] = f"{num / den:.0f} mm"

                    if '0xa405' in exif_data['Exif']:  # FocalLengthIn35mmFilm
                        metadata['FocalLengthIn35mmFormat'] = f"{exif_data['Exif']['0xa405']} mm"

                    # Add more mappings as needed
                    if '0x9207' in exif_data['Exif']:  # MeteringMode
                        mode = exif_data['Exif']['0x9207']
                        metadata['MeteringMode'] = METERING_MODES.get(mode, f"Unknown ({mode})")

                    if '0x9209' in exif_data['Exif']:  # Flash
                        flash = exif_data['Exif']['0x9209']
                        metadata['Flash'] = FLASH_MODES.get(flash, f"Unknown ({flash})")

                    if '0x8822' in exif_data['Exif']:  # ExposureProgram
                        program = exif_data['Exif']['0x8822']
                        metadata['ExposureProgram'] = EXPOSURE_PROGRAMS.get(program, f"Unknown ({program})")

                    if '0xa403' in exif_data['Exif']:  # WhiteBalance
                        wb = exif_data['Exif']['0xa403']
                        metadata['WhiteBalance'] = WHITE_BALANCE.get(wb, f"Unknown ({wb})")

                    if '0x9003' in exif_data['Exif']:  # DateTimeOriginal
                        date_str = exif_data['Exif']['0x9003'].decode('utf-8', errors='replace')
                        metadata['DateTimeOriginal'] = date_str
                except Exception as e:
                    logging.error(f"Error parsing EXIF data for {image_path.name}: {e}")

    except Exception as e:
        logging.error(f"Error extracting metadata from {image_path.name}: {e}")

    return metadata


def extract_metadata_exiftool(image_path: Path, exiftool_path: str) -> Dict[str, Any]:
    """
    Extract metadata using ExifTool (more comprehensive).

    Args:
        image_path: Path to the image file
        exiftool_path: Path to the exiftool executable

    Returns:
        Dictionary of extracted metadata
    """
    metadata = {}

    try:
        # Run ExifTool with detailed error output
        cmd = [exiftool_path, '-j', '-n', '-a', '-u', '-G1', str(image_path)]
        result = subprocess.run(cmd, capture_output=True, text=True, check=False)

        if result.returncode != 0:
            logging.error(f"ExifTool error ({result.returncode}) for {image_path.name}: {result.stderr}")
            # Try with a more permissive approach
            cmd = [exiftool_path, '-j', '-n', '-fast', '-m', str(image_path)]
            result = subprocess.run(cmd, capture_output=True, text=True, check=False)

            if result.returncode != 0:
                logging.error(f"Even permissive ExifTool approach failed for {image_path.name}")
                return metadata

        # Check if we got valid JSON output
        if not result.stdout or not result.stdout.strip():
            logging.error(f"Empty ExifTool output for {image_path.name}")
            return metadata

        try:
            # Parse the JSON output (exiftool returns a list with one item)
            exif_data = json.loads(result.stdout)[0]
        except json.JSONDecodeError as e:
            logging.error(f"Invalid JSON from ExifTool for {image_path.name}: {e}")
            logging.debug(f"Raw output: {result.stdout[:200]}...")
            return metadata

        # Extract relevant fields (customize based on what you want to display)
        mapping = {
            'Make': 'Make',
            'Model': 'Model',
            'FNumber': 'FNumber',
            'ExposureTime': 'ExposureTime',
            'ISO': 'ISO',
            'ExposureBiasValue': 'ExposureCompensation',
            'FocalLength': 'FocalLength',
            'FocalLengthIn35mmFormat': 'FocalLengthIn35mmFormat',
            'LensModel': 'LensModel',
            'DateTimeOriginal': 'DateTimeOriginal',
            'Flash': 'Flash',
            'MeteringMode': 'MeteringMode',
            'ExposureProgram': 'ExposureProgram',
            'WhiteBalance': 'WhiteBalance',
        }

        for web_key, exif_key in mapping.items():
            if exif_key in exif_data:
                # Handle specific formatting for certain fields
                if web_key == 'FNumber':
                    metadata[web_key] = f"f/{exif_data[exif_key]}"
                elif web_key == 'ExposureTime':
                    value = exif_data[exif_key]
                    if value < 1:
                        metadata[web_key] = f"1/{1 / value:.0f} sec"
                    else:
                        metadata[web_key] = f"{value} sec"
                elif web_key == 'ISO':
                    metadata[web_key] = f"ISO-{exif_data[exif_key]}"
                elif web_key == 'FocalLength' or web_key == 'FocalLengthIn35mmFormat':
                    metadata[web_key] = f"{exif_data[exif_key]} mm"
                elif web_key == 'ExposureBiasValue':
                    metadata[web_key] = f"{exif_data[exif_key]:+.1f} EV"
                else:
                    metadata[web_key] = exif_data[exif_key]

        # Add image dimensions
        if 'ImageWidth' in exif_data and 'ImageHeight' in exif_data:
            metadata['Width'] = exif_data['ImageWidth']
            metadata['Height'] = exif_data['ImageHeight']

        metadata['Filename'] = image_path.name

    except Exception as e:
        logging.error(f"Error running ExifTool for {image_path.name}: {e}")

    return metadata


def create_dummy_metadata(filename: str) -> Dict[str, Any]:
    """
    Create dummy metadata for images where extraction fails.
    This ensures we have at least something to display.
    """
    # Try to extract information from the filename
    name_parts = filename.split('_')
    location = "Unknown"

    # Try to determine location from filename
    if 'bkk' in filename.lower():
        location = "Bangkok, Thailand"
    elif 'chiang_mai' in filename.lower() or 'chiangmai' in filename.lower():
        location = "Chiang Mai, Thailand"

    # Extract any numbers that look like a year
    year = "2024"  # Default year
    for part in name_parts:
        if part.isdigit() and len(part) == 4 and part.startswith(('19', '20')):
            year = part
            break

    return {
        'Filename': filename,
        'UserComment': f"Photo taken in {location}, {year}",
        'Location': location,
        'Year': year,
        'Make': "Nikon",
        'Model': "D750",
        'IsDummyData': True  # Flag to indicate this is not real EXIF data
    }


def process_image_collection(collection_path: Path, exiftool_path: Optional[str], use_dummy_data: bool = True) -> Dict[
    str, Dict[str, Any]]:
    """Process all images in a collection and extract their metadata."""
    collection_metadata = {}

    # Find all supported image files
    image_extensions = {'.jpg', '.jpeg', '.png', '.tiff', '.tif', '.nef', '.cr2'}
    image_files = [f for f in collection_path.iterdir()
                   if f.is_file() and f.suffix.lower() in image_extensions]

    logging.info(f"Found {len(image_files)} images in {collection_path.name}")

    exiftool_working = False
    if exiftool_path:
        exiftool_working = test_exiftool(exiftool_path)

    for image_path in image_files:
        # Generate output filename (matches the webp filename in the website)
        output_key = f"{image_path.stem}.webp"

        metadata = {}

        # Try to extract metadata with the best available method
        if exiftool_working:
            metadata = extract_metadata_exiftool(image_path, exiftool_path)

        # If ExifTool failed or isn't available, try Pillow
        if not metadata:
            metadata = extract_metadata_pillow(image_path)

        # If both methods failed and dummy data is allowed, create dummy metadata
        if not metadata and use_dummy_data:
            metadata = create_dummy_metadata(image_path.name)
            logging.info(f"Using dummy metadata for {image_path.name}")

        if metadata:
            collection_metadata[output_key] = metadata
            if 'IsDummyData' not in metadata:
                logging.info(f"Extracted metadata from {image_path.name}")
        else:
            logging.warning(f"No metadata extracted from {image_path.name}")

    return collection_metadata


def main():
    """Main function to extract metadata from all collections."""
    base_path = find_base_path()
    if not base_path:
        logging.error("No images directory found")
        return

    # Find ExifTool path (preferred method)
    exiftool_path = get_exiftool_path()
    if exiftool_path:
        logging.info(f"Using ExifTool at: {exiftool_path}")
    else:
        logging.warning("ExifTool not found, falling back to Pillow/piexif (limited metadata)")

    all_metadata = {}

    # Process each collection
    for collection in base_path.iterdir():
        if collection.is_dir():
            logging.info(f"Processing collection: {collection.name}")
            collection_metadata = process_image_collection(collection, exiftool_path)
            all_metadata[collection.name] = collection_metadata

    # Write metadata to file
    output_path = base_path.parent / 'assets' / 'js' / 'imageMetadata.js'
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        js_content = f"export const imageMetadata = {json.dumps(all_metadata, indent=2)};"
        f.write(js_content)

    logging.info(f"Metadata saved to {output_path}")

    # Summary
    total_images = sum(len(collection) for collection in all_metadata.values())
    logging.info(f"Processed metadata for {total_images} images in {len(all_metadata)} collections")


if __name__ == '__main__':
    main()