$url = 'http://localhost:5173'
try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -ne 200) {
        throw 'Site not ready'
    }
    Write-Host 'Dev server is already running'
    $started = $false
} catch {
    Write-Host 'Starting dev server...'
    $proc = Start-Process -FilePath npm -ArgumentList 'run dev' -WindowStyle Hidden -PassThru
    # Wait up to 30 seconds for server to be ready
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) { $ready = $true; break }
        } catch {}
    }
    if (-not $ready) {
        Write-Host 'Dev server failed to start in time'
        Stop-Process -Id $proc.Id
        exit 1
    }
    Write-Host 'Dev server started'
    $started = $true
}

# Run the verification script
Write-Host 'Running verifyPlayerSpriteReuse.mjs...'
node tools/browser/verifyPlayerSpriteReuse.mjs
$exitCode = $LASTEXITCODE

# If we started the dev server, stop it
if ($started) {
    Write-Host 'Stopping dev server...'
    Stop-Process -Id $proc.Id
}

exit $exitCode