$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvActivate = Join-Path $root '.venv\Scripts\Activate.ps1'

if (-not (Test-Path $venvActivate)) {
    throw "Virtual environment not found at $venvActivate. Run: python -m venv .venv"
}

& $venvActivate
Set-Location $root

$reqFile = Join-Path $root 'backend\requirements.txt'
if (Test-Path $reqFile) {
    python -m pip install -r $reqFile
}
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
