Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Explicit logging function
function Write-DebugLog {
   param([string]$Message)
   Write-Host "[DEBUG] $Message" -ForegroundColor Cyan
}

# Start comprehensive logging
Write-DebugLog "Script execution started"
Write-DebugLog "Current working directory: $(Get-Location)"

# Verify images directory exists
$imagesPath = ".\images"
if (-not (Test-Path $imagesPath)) {
   Write-Error "Images directory not found: $imagesPath"
   exit 1
}

Write-DebugLog "Images directory verified: $imagesPath"

# Collect subdirectories, log their details
$collections = Get-ChildItem $imagesPath -Directory

Write-DebugLog "Found collections: $($collections.Name -join ', ')"

# Create hash to store collections
$collectionsHash = @{}

foreach ($collection in $collections) {
   $collectionName = $collection.Name
   Write-DebugLog "Processing collection: $collectionName"

   $imageFiles = Get-ChildItem $collection.FullName -File |
       Where-Object { $_.Extension -match '\.(jpg|jpeg|png)$' } |
       Select-Object -ExpandProperty Name

   Write-DebugLog "Images in $collectionName`: $($imageFiles.Count)"

   if ($imageFiles.Count -gt 0) {
       $collectionsHash[$collectionName] = $imageFiles
   }
}

# Convert to JSON with depth to handle nested structures
$jsonContent = $collectionsHash | ConvertTo-Json -Depth 10

Write-DebugLog "Generated JSON content length: $($jsonContent.Length)"

# Generate JavaScript export
$jsContent = "export const imageCollections = $jsonContent;"
Set-Content -Path ".\assets\js\imageList.js" -Value $jsContent

Write-DebugLog "Final collections summary:"
$collectionsHash.Keys | ForEach-Object {
   Write-Host "$_`: $($collectionsHash[$_].Count) images" -ForegroundColor Green
}

Write-DebugLog "Script execution completed successfully"