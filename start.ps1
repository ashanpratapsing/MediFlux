# MediFlux - Full Stack Launcher
# Starts all 4 services in the correct order

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "  MediFlux Healthcare Platform" -ForegroundColor Cyan
Write-Host "  Starting all services..." -ForegroundColor DarkGray
Write-Host ""

function Start-MediFluxService {
    param(
        [string]$Title,
        [string]$WorkDir,
        [string]$Cmd,
        [string]$Color = "White"
    )
    Write-Host "  Starting: $Title" -ForegroundColor $Color
    $args = "-NoExit -Command `"cd '$WorkDir'; $Cmd`""
    Start-Process powershell -ArgumentList $args -WindowStyle Normal
}

# 1 - BFF API Gateway
Start-MediFluxService -Title "BFF :4000" -WorkDir "$root\apps\bff" -Cmd "npx tsx src/index.ts" -Color "Yellow"
Start-Sleep -Seconds 3

# 2 - Analytics MFE (build then preview in sequence)
Start-MediFluxService -Title "Analytics MFE :3001 (build)" -WorkDir "$root\apps\analytics-mf" -Cmd "npx vite build; npx vite preview" -Color "Magenta"
Start-Sleep -Seconds 2

# 3 - Patient MFE
Start-MediFluxService -Title "Patient MFE :3002 (build)" -WorkDir "$root\apps\patient-mf" -Cmd "npx vite build; npx vite preview" -Color "Magenta"

Write-Host "  Waiting 12s for MFEs to build and serve..." -ForegroundColor DarkGray
Start-Sleep -Seconds 12

# 4 - App Shell (last - needs remotes ready)
Start-MediFluxService -Title "App Shell :3010" -WorkDir "$root\apps\web" -Cmd "npx vite" -Color "Cyan"

Write-Host ""
Write-Host "  All services launched!" -ForegroundColor Green
Write-Host ""
Write-Host "  URL            Service" -ForegroundColor DarkGray
Write-Host "  -----------------------------------" -ForegroundColor DarkGray
Write-Host "  http://localhost:3010   App Shell" -ForegroundColor Cyan
Write-Host "  http://localhost:3001   Analytics MFE" -ForegroundColor Magenta
Write-Host "  http://localhost:3002   Patient MFE" -ForegroundColor Magenta
Write-Host "  http://localhost:4000   BFF API" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Credentials:" -ForegroundColor DarkGray
Write-Host "  admin@test.com  / 123456  (Admin)" -ForegroundColor Green
Write-Host "  doctor@test.com / 123456  (Doctor)" -ForegroundColor Green
Write-Host "  staff@test.com  / 123456  (Staff)" -ForegroundColor Green
Write-Host ""
