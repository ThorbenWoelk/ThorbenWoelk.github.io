param(
    [Parameter(Mandatory=$true)]
    [string]$imagePath
)

if (!(Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Error "Run: winget install ImageMagick.ImageMagick"
    exit 1
}

$dirs = @("./assets/images/large", "./assets/images/grid", "./assets/images/thumb")
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

$filename = Split-Path $imagePath -Leaf

magick $imagePath -resize 2048x1365 -quality 85 -strip "./assets/images/large/$filename"
magick $imagePath -resize 1200x800 -quality 85 -strip "./assets/images/grid/$filename"
magick $imagePath -resize 600x400 -quality 85 -strip "./assets/images/thumb/$filename"

Write-Output "Processed $filename"