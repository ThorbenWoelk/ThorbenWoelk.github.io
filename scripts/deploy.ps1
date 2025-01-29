# deploy.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptPath = $PSScriptRoot
$rootPath = Split-Path $scriptPath -Parent
$log = Join-Path $rootPath "deploy.log"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp $Message"
    Write-Output $logMessage
    Add-Content -Path $log -Value $logMessage
}

try {
    Write-Log "=== Starting deployment ==="

    # 1. Ensure directories
    "images", "src", "assets/js" | ForEach-Object {
        $path = Join-Path $rootPath $_
        if (!(Test-Path $path)) {
            New-Item -Path $path -ItemType Directory -Force | Out-Null
        }
    }

    # 2. Process images
    Write-Log "Processing images..."
    & "$scriptPath\batch.ps1"

    # 3. Generate image list
    Write-Log "Generating image list..."
    $imagesPath = Join-Path $rootPath "images\*.jpg"
    $imageList = Get-ChildItem $imagesPath |
                Select-Object -ExpandProperty Name |
                Sort-Object |
                ConvertTo-Json

    $jsContent = "export const imageFiles = $imageList;"
    Set-Content -Path (Join-Path $rootPath "assets\js\imageList.js") -Value $jsContent -Encoding UTF8

    Write-Log "=== Deployment complete ==="
}
catch {
    Write-Log "CRITICAL: Deployment failed - $_"
    exit 1
}