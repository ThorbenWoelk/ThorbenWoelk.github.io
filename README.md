# Toto's Photos Portfolio

Modern photography portfolio optimized for high-resolution images (6016x4016px).

## Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/toto-photos.git
cd toto-photos

# Set up image processing script
chmod +x scripts/optimize.sh

# Process images (requires ImageMagick)
./scripts/optimize.sh path/to/photo.jpg

# Start local server
python3 -m http.server 8000
```

## Image Optimization

Images are automatically processed into 4 sizes:
- Original (6016x4016px) - preserved
- Large (2048x1365px) - modal view
- Grid (1200x800px) - gallery view
- Thumb (600x400px) - mobile optimization

## Directory Structure

```
toto-photos/
├── assets/
│   ├── css/
│   │   ├── main.css    - Core styles
│   │   ├── grid.css    - Gallery layout
│   │   └── modal.css   - Image modal
│   ├── js/
│   │   ├── main.js     - Site initialization
│   │   └── modal.js    - Modal functionality
│   └── images/
│       ├── original/   - Full resolution
│       ├── large/      - Modal view
│       ├── grid/       - Gallery view
│       └── thumb/      - Mobile
├── scripts/
│   └── optimize.sh     - Image processing
├── index.html
└── README.md
```

## Development

1. Add photos to `assets/images/original/`
2. Run optimization script
3. Update `index.html` with new photo entries
4. Test responsive behavior

## Deployment

1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Site will be live at `https://yourusername.github.io/toto-photos`