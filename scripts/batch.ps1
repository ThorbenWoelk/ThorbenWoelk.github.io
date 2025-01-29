Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptPath = $PSScriptRoot
$rootPath = Split-Path $scriptPath -Parent
$sourceDir = Join-Path $rootPath "images"
$outputDirs = @{
    large = Join-Path $rootPath "assets\images\large"
    grid  = Join-Path $rootPath "assets\images\grid"
    thumb = Join-Path $rootPath "assets\images\thumb"
}
$logFile = Join-Path $rootPath "image_processing.log"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "$timestamp $Message"
    Write-Output $logMessage
    Add-Content -Path $logFile -Value $logMessage
}

function Test-ImageValid {
    param([string]$path)
    try {
        $result = magick identify $path
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

function Get-DerivedPaths {
    param([string]$sourceName)
    $outputDirs.Keys | ForEach-Object {
        Join-Path $outputDirs[$_] $sourceName
    }
}

try {
    if (!(Get-Command magick -ErrorAction SilentlyContinue)) {
        throw "ImageMagick not found. Run: winget install ImageMagick.ImageMagick"
    }

    foreach ($dir in $outputDirs.Values) {
        if (!(Test-Path $dir)) {
            Write-Log "Creating directory: $dir"
            New-Item -ItemType Directory -Path $dir | Out-Null
        }
    }

    Write-Log "=== Starting batch processing ==="
    $stats = @{
        Processed = 0
        Skipped = 0
        Deleted = 0
        Failed = 0
    }

    Get-ChildItem "$sourceDir\*.jpg" | ForEach-Object {
        $sourcePath = $_.FullName
        $sourceName = $_.Name
        $derivedPaths = Get-DerivedPaths $sourceName

        try {
            $needsUpdate = $false
            $sourceTime = (Get-Item $sourcePath).LastWriteTime.ToFileTimeUtc()

            foreach ($path in $derivedPaths) {
                if (!(Test-Path $path) -or
                    (Get-Item $path).LastWriteTime.ToFileTimeUtc() -lt $sourceTime) {
                    $needsUpdate = $true
                    break
                }
            }

            if (!$needsUpdate) {
                Write-Log "SKIP: $sourceName - derivatives up to date"
                $stats.Skipped++
                return
            }

            Write-Log "PROCESS: $sourceName"
            & "$scriptPath\optimize.ps1" -imagePath $sourcePath
            if ($LASTEXITCODE -ne 0) {
                throw "optimize.ps1 failed with exit code $LASTEXITCODE"
            }

            $failed = $false
            foreach ($path in $derivedPaths) {
                if (!(Test-Path $path) -or !(Test-ImageValid $path)) {
                    $failed = $true
                    Write-Log "ERROR: Failed to validate $path"
                    break
                }
            }

            if ($failed) {
                throw "Output validation failed"
            }

            $stats.Processed++
        }
        catch {
            Write-Log "ERROR: Failed to process $sourceName - $_"
            $stats.Failed++
        }
    }

    foreach ($dir in $outputDirs.Values) {
        Get-ChildItem "$dir\*.jpg" | ForEach-Object {
            $sourcePath = Join-Path $sourceDir $_.Name
            if (!(Test-Path $sourcePath)) {
                Write-Log "DELETE: Removing orphaned $($_.Name) from $dir"
                Remove-Item $_.FullName -Force
                $stats.Deleted++
            }
        }
    }

    Write-Log "=== Processing complete ==="
    Write-Log "Summary:"
    Write-Log "- Processed: $($stats.Processed)"
    Write-Log "- Skipped: $($stats.Skipped)"
    Write-Log "- Deleted: $($stats.Deleted)"
    Write-Log "- Failed: $($stats.Failed)"

    if ($stats.Failed -gt 0) {
        exit 1
    }
}
catch {
    Write-Log "CRITICAL: Script failed - $_"
    exit 1
}