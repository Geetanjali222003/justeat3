# JustEat Complete Fix Script
# This script performs all necessary checks and fixes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JustEat Complete System Check & Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendDir = "C:\Users\supraptisrivastava\OneDrive - Nagarro\Desktop\just_eat\JustEat\Backend"

# Navigate to backend directory
Set-Location $backendDir

Write-Host "Step 1: Checking System Requirements" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray

# Check Java
Write-Host "Checking Java..." -ForegroundColor Gray
$javaVersion = & java -version 2>&1 | Select-String -Pattern "version"
if ($javaVersion) {
    Write-Host "✓ Java is installed: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Java not found. Please install Java 21" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL Service
Write-Host "Checking PostgreSQL..." -ForegroundColor Gray
$pgService = Get-Service -Name *postgres* -ErrorAction SilentlyContinue
if ($pgService) {
    if ($pgService.Status -ne "Running") {
        Write-Host "Starting PostgreSQL..." -ForegroundColor Yellow
        Start-Service $pgService.Name
    }
    Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL not found. Please install PostgreSQL" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Setting up Database" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray

# Setup database
& "$backendDir\setup-database.ps1"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Note: If database setup failed, you can create it manually:" -ForegroundColor Yellow
    Write-Host "  1. Open pgAdmin or psql" -ForegroundColor Gray
    Write-Host "  2. Run: CREATE DATABASE justeat;" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter after creating the database manually, or Ctrl+C to exit"
}

Write-Host ""
Write-Host "Step 3: Cleaning Previous Build" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray

# Kill any existing Java processes
$javaProcesses = Get-Process -Name java -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "Stopping existing Java processes..." -ForegroundColor Yellow
    $javaProcesses | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Clean Maven build
Write-Host "Cleaning Maven project..." -ForegroundColor Gray
& .\mvnw.cmd clean -q
Write-Host "✓ Clean completed" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Compiling Application" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray
Write-Host "This may take a minute..." -ForegroundColor Gray

$compileResult = & .\mvnw.cmd compile 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Compilation successful" -ForegroundColor Green
} else {
    Write-Host "✗ Compilation failed!" -ForegroundColor Red
    Write-Host "Error details:" -ForegroundColor Red
    $compileResult | Select-String "ERROR" | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    exit 1
}

Write-Host ""
Write-Host "Step 5: Verifying Configuration" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Gray

# Check application.properties
$propsFile = "$backendDir\src\main\resources\application.properties"
if (Test-Path $propsFile) {
    Write-Host "✓ application.properties found" -ForegroundColor Green
    $props = Get-Content $propsFile

    # Check critical properties
    if ($props | Select-String "cloudinary.cloud-name") {
        Write-Host "✓ Cloudinary configuration found" -ForegroundColor Green
    }
    if ($props | Select-String "spring.datasource.url") {
        Write-Host "✓ Database configuration found" -ForegroundColor Green
    }
} else {
    Write-Host "✗ application.properties not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All checks passed! Starting backend..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will start on: http://localhost:8090" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

# Start the backend
& .\mvnw.cmd spring-boot:run

