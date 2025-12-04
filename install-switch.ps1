# Script para instalar la dependencia del componente Switch
# Ejecutar desde la carpeta web-consultorio

Write-Host "Instalando @radix-ui/react-switch..." -ForegroundColor Green

# Detectar si usa npm o pnpm
if (Test-Path "pnpm-lock.yaml") {
    Write-Host "Detectado pnpm, instalando con pnpm..." -ForegroundColor Yellow
    pnpm add @radix-ui/react-switch
} elseif (Test-Path "package-lock.json") {
    Write-Host "Detectado npm, instalando con npm..." -ForegroundColor Yellow
    npm install @radix-ui/react-switch
} else {
    Write-Host "No se detectó gestor de paquetes, usando npm por defecto..." -ForegroundColor Yellow
    npm install @radix-ui/react-switch
}

Write-Host "✓ Instalación completada!" -ForegroundColor Green
Write-Host ""
Write-Host "El componente Switch ya está listo para usar." -ForegroundColor Cyan
