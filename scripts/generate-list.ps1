Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$imageList = Get-ChildItem ".\images\*.jpg" | Select-Object -ExpandProperty Name | ConvertTo-Json
$jsContent = "export const imageFiles = $imageList;"
Set-Content -Path ".\assets\js\imageList.js" -Value $jsContent