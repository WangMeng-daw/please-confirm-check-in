$gameDirectory = $PSScriptRoot
$gameUrl = 'http://localhost:5193'
$gameReady = $false
try {
    $gameResponse = Invoke-WebRequest -Uri $gameUrl -UseBasicParsing -TimeoutSec 2
    if ($gameResponse.Headers['X-Game'] -eq 'haunted-stay') { $gameReady = $true }
    else { throw 'Port 5193 is used by another application.' }
} catch {
    if ($_.Exception.Message -like '*used by another*') { throw }
}
if (-not $gameReady) {
    $gameNode = (Get-Command node -ErrorAction SilentlyContinue).Source
    if (-not $gameNode) {
        $gameBundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
        if (Test-Path -LiteralPath $gameBundledNode) { $gameNode = $gameBundledNode }
    }
    if (-not $gameNode) { throw 'Node.js is required. Install Node.js and run this launcher again.' }
    Start-Process -FilePath $gameNode -ArgumentList 'server.cjs' -WorkingDirectory $gameDirectory -WindowStyle Hidden
    for ($gameAttempt=0; $gameAttempt -lt 30; $gameAttempt++) {
        Start-Sleep -Milliseconds 200
        try {
            $gameResponse = Invoke-WebRequest -Uri $gameUrl -UseBasicParsing -TimeoutSec 1
            if ($gameResponse.Headers['X-Game'] -eq 'haunted-stay') { $gameReady=$true; break }
        } catch {}
    }
}
if (-not $gameReady) { throw 'The local game server could not start on port 5193.' }
Start-Process $gameUrl
