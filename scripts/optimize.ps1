param(
    [Parameter(Mandatory=$true)]
    [string]$imagePath
)

$scriptPath = $PSScriptRoot
$rootPath = Split-Path $scriptPath -Parent

if (!(Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Error "Run: winget install ImageMagick.ImageMagick"
    exit 1
}

$dirs = @(
    (Join-Path $rootPath "assets\images\large"),
    (Join-Path $rootPath "assets\images\grid"),
    (Join-Path $rootPath "assets\images\thumb")
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

$filename = Split-Path $imagePath -Leaf

magick $imagePath -resize 2048x1365 -quality 85 -strip (Join-Path $rootPath "assets\images\large\$filename")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

magick $imagePath -resize 1200x800 -quality 85 -strip (Join-Path $rootPath "assets\images\grid\$filename")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

magick $imagePath -resize 600x400 -quality 85 -strip (Join-Path $rootPath "assets\images\thumb\$filename")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Output "Processed $filename"