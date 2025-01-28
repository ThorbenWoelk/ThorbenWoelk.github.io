#!/bin/bash

# Required: ImageMagick
# Usage: ./optimize.sh path/to/image.jpg

input=$1
filename=$(basename -- "$input")
name="${filename%.*}"

mkdir -p assets/images/{original,large,grid,thumb}

# Copy original
cp "$input" "assets/images/original/$filename"

# Generate sizes
convert "$input" -resize 2048x1365 -quality 85 -strip "assets/images/large/$filename"
convert "$input" -resize 1200x800 -quality 85 -strip "assets/images/grid/$filename"
convert "$input" -resize 600x400 -quality 85 -strip "assets/images/thumb/$filename"

echo "Processed $filename"