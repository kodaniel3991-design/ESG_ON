# CarbonOS - Clean dev start (use when you see 500 on localhost:3000)
# Run: .\scripts\dev-clean.ps1   or   pwsh -File scripts\dev-clean.ps1

Write-Host "Stopping any Node processes using port 3000..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

if (Test-Path .next) {
    Write-Host "Removing .next cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next
}

Write-Host "Starting dev server..." -ForegroundColor Green
npm run dev
