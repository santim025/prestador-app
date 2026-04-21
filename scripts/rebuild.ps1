# Rebuild LendTrack con BuildKit activo (evita imágenes <none> residuales).
# Uso:  .\scripts\rebuild.ps1

$ErrorActionPreference = "Stop"

$env:DOCKER_BUILDKIT = 1
$env:COMPOSE_DOCKER_CLI_BUILD = 1

Write-Host "[lendtrack] Deteniendo contenedor..." -ForegroundColor Cyan
docker-compose down

Write-Host "[lendtrack] Construyendo imagen con BuildKit..." -ForegroundColor Cyan
docker-compose up -d --build

Write-Host "[lendtrack] Limpiando imagenes dangling residuales..." -ForegroundColor Cyan
docker image prune -f | Out-Null

Write-Host "[lendtrack] Listo. Imagenes actuales:" -ForegroundColor Green
docker images
