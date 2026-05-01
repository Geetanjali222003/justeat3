# Backend Startup Script with Error Checking
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JustEat Backend Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: PostgreSQL Service
Write-Host "[1/5] Checking PostgreSQL Service..." -ForegroundColor Yellow
$pgService = Get-Service -Name *postgres* -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -eq "Running") {
        Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL is not running. Starting..." -ForegroundColor Red
        Start-Service $pgService.Name
        Write-Host "✓ PostgreSQL started" -ForegroundColor Green
    }
} else {
    Write-Host "✗ PostgreSQL service not found. Please install PostgreSQL!" -ForegroundColor Red
    exit 1
}

# Check 2: Port 8090 availability
Write-Host ""
Write-Host "[2/5] Checking if port 8090 is available..." -ForegroundColor Yellow
$port8090 = Get-NetTCPConnection -LocalPort 8090 -ErrorAction SilentlyContinue
if ($port8090) {
    Write-Host "✗ Port 8090 is already in use. Stopping existing Java processes..." -ForegroundColor Red
    Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 3
    Write-Host "✓ Port 8090 is now available" -ForegroundColor Green
} else {
    Write-Host "✓ Port 8090 is available" -ForegroundColor Green
}

# Check 3: Maven wrapper exists
Write-Host ""
Write-Host "[3/5] Checking Maven wrapper..." -ForegroundColor Yellow
if (Test-Path ".\mvnw.cmd") {
    Write-Host "✓ Maven wrapper found" -ForegroundColor Green
} else {
    Write-Host "✗ Maven wrapper not found!" -ForegroundColor Red
    exit 1
}

# Check 4: Clean and compile
Write-Host ""
Write-Host "[4/5] Cleaning and compiling project..." -ForegroundColor Yellow
Write-Host "This may take a moment..." -ForegroundColor Gray
$compileOutput = & .\mvnw.cmd clean compile 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Project compiled successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Compilation failed. Output:" -ForegroundColor Red
    Write-Host $compileOutput -ForegroundColor Red
    exit 1
}

# Check 5: Start the application
Write-Host ""
Write-Host "[5/5] Starting Spring Boot application..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend is starting on http://localhost:8090" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

& .\mvnw.cmd spring-boot:run

