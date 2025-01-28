# Toto's Photos Portfolio

Photography portfolio optimized for 6016x4016px images.

## Install

```powershell
winget install ImageMagick.ImageMagick
```

## Run

```powershell
# Process single image
.\scripts\optimize.ps1 -imagePath ".\images\IMG_1234.jpg"

# Process all images in \images folder
.\scripts\batch.ps1

# Start server (choose one)
python -m http.server 8000
# or
npx serve
```

## Image Template

```html

<div class="photo-item wide">
    <img
            src="images/grid/IMG_1234.jpg"
            data-full="./assets/images/large/IMG_1234.jpg"
            alt="Photo description"
            loading="lazy"
    >
    <div class="photo-info">
        <h3>Title</h3>
        <p>Category</p>
    </div>
</div>
```

## Structure

```
toto-photos/
├── images/           # Your original photos
│   └── IMG_*.jpg    # 6016x4016px
├── assets/
│   └── images/      # Auto-generated sizes
│       ├── large/   # 2048x1365px
│       ├── grid/    # 1200x800px
│       └── thumb/   # 600x400px
└── index.html
```

## Deploy

```powershell
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/username/username.github.io.git
git push -u origin main
```