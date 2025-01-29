# Toto's Photos Portfolio

Photography portfolio optimized for 6016x4016px images.

## Prerequisites

```powershell
winget install ImageMagick.ImageMagick
npm install -g serve  # Optional, for development server
```

## Development

```powershell
# Deploy: process images and start server
.\scripts\deploy.ps1

# Manual operations if needed:
.\scripts\optimize.ps1 -imagePath ".\images\IMG_1234.jpg"  # Single image
.\scripts\batch.ps1    # All images
npx serve             # Development server
```

## Deploy to GitHub Pages

```powershell
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/username/username.github.io.git
git push -u origin main
```