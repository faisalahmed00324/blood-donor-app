param(
    [string]$OutputDir = "publish\manual-deploy",
    [switch]$SkipNpmInstall
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$outputPath = Join-Path $repoRoot $OutputDir
$apiPublishPath = Join-Path $outputPath "api"
$webPublishPath = Join-Path $outputPath "web"
$deployPath = Join-Path $outputPath "deployment"

if (Test-Path -LiteralPath $outputPath) {
    Remove-Item -LiteralPath $outputPath -Recurse -Force
}

New-Item -ItemType Directory -Path $apiPublishPath | Out-Null
New-Item -ItemType Directory -Path $webPublishPath | Out-Null
New-Item -ItemType Directory -Path $deployPath | Out-Null

dotnet publish (Join-Path $repoRoot "backend\BloodDonor.API\src\BloodDonor.Api\BloodDonor.Api.csproj") -c Release -o $apiPublishPath

Push-Location (Join-Path $repoRoot "frontend\blood-donor-web")
try {
    if (-not $SkipNpmInstall) {
        npm ci
    }
    $env:VITE_API_URL = ""
    npm run build
}
finally {
    Pop-Location
}

$webDistPath = Join-Path $repoRoot "frontend\blood-donor-web\dist"
$deploymentSourcePath = Join-Path $repoRoot "deployment"

Copy-Item -Path (Join-Path $webDistPath "*") -Destination $webPublishPath -Recurse -Force
Copy-Item -Path (Join-Path $deploymentSourcePath "*") -Destination $deployPath -Recurse -Force
Copy-Item -LiteralPath (Join-Path $repoRoot "MANUAL_DEPLOY_ORACLE.md") -Destination (Join-Path $outputPath "MANUAL_DEPLOY_ORACLE.md") -Force

Compress-Archive -Path (Join-Path $outputPath "*") -DestinationPath (Join-Path $repoRoot "publish\bloodconnect-manual-deploy.zip") -Force

Write-Host "Manual deployment bundle created at publish\bloodconnect-manual-deploy.zip"
