# Verify ImageMagick
if (!(Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Error "Run: winget install ImageMagick.ImageMagick"
    exit 1
}

# Process all images
Get-ChildItem ".\images\*.jpg" | ForEach-Object {
    Write-Output "Processing $($_.Name)..."
    .\scripts\optimize.ps1 -imagePath $_.FullName
}