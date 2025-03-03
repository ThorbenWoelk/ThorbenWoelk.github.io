# Toto's Photography Portfolio

This is [Toto's personal photography website](https://thorbenwoelk.github.io/).


## Developer Guide
### Prerequisites

#### Windows
```bash
# Install ImageMagick
winget install ImageMagick.ImageMagick 

# Setup Python environment
python3 -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

### How to run
Navigate to root repo folder and run `npx serve`

# ExifTool Installation Guide

ExifTool is a powerful command-line application for reading, writing, and editing metadata in a wide variety of files, especially image files. For the best metadata extraction results in this photo portfolio website, we recommend installing ExifTool.

## Windows Installation

1. **Download ExifTool**:
   - Visit the official ExifTool website: https://exiftool.org/
   - Download the Windows Executable (.exe) version
   - The file will be named something like `exiftool-XX.XX.exe` where XX.XX is the version number

2. **Rename and Move the File**:
   - Rename the downloaded file from `exiftool-XX.XX.exe` to just `exiftool.exe`
   - Create a folder like `C:\Program Files\ExifTool\` and move the file there
   
3. **Add to PATH** (optional but recommended):
   - Right-click on "This PC" or "My Computer" and select "Properties"
   - Click on "Advanced system settings"
   - Click on the "Environment Variables" button
   - Under "System variables", find the "Path" variable, select it and click "Edit"
   - Click "New" and add `C:\Program Files\ExifTool\`
   - Click "OK" on all windows
