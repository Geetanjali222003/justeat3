# Database Setup Script for JustEat
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JustEat Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$dbName = "justeat"
$dbUser = "postgres"
$dbPassword = "root"
$dbHost = "localhost"
$dbPort = "5432"

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost" -ForegroundColor Gray
Write-Host "  Port: $dbPort" -ForegroundColor Gray
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray
Write-Host ""

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "✗ psql command not found. Please add PostgreSQL bin folder to PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Use pgAdmin to create the database manually:" -ForegroundColor Yellow
    Write-Host "  1. Open pgAdmin" -ForegroundColor Gray
    Write-Host "  2. Connect to PostgreSQL server" -ForegroundColor Gray
    Write-Host "  3. Right-click on 'Databases' -> Create -> Database" -ForegroundColor Gray
    Write-Host "  4. Database name: justeat" -ForegroundColor Gray
    Write-Host "  5. Owner: postgres" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "[1/2] Checking if database exists..." -ForegroundColor Yellow

# Set PGPASSWORD environment variable for automatic authentication
$env:PGPASSWORD = $dbPassword

# Check if database exists
$dbExists = & psql -h $dbHost -p $dbPort -U $dbUser -lqt 2>$null | Select-String -Pattern "^\s*$dbName\s"

if ($dbExists) {
    Write-Host "✓ Database '$dbName' already exists" -ForegroundColor Green
} else {
    Write-Host "Database '$dbName' does not exist. Creating..." -ForegroundColor Yellow

    # Create database
    $createResult = & psql -h $dbHost -p $dbPort -U $dbUser -c "CREATE DATABASE $dbName;" postgres 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database '$dbName' created successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database:" -ForegroundColor Red
        Write-Host $createResult -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "[2/2] Testing database connection..." -ForegroundColor Yellow

# Test connection
$testResult = & psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "SELECT 1;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully connected to database '$dbName'" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Database setup complete!" -ForegroundColor Green
    Write-Host "You can now start the backend server" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
} else {
    Write-Host "✗ Failed to connect to database:" -ForegroundColor Red
    Write-Host $testResult -ForegroundColor Red
    exit 1
}

# Clear password from environment
Remove-Item Env:\PGPASSWORD

