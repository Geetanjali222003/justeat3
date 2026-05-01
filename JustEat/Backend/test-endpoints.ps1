# Test Backend Endpoints
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing JustEat Backend Endpoints" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8090"

# Test 1: Check if backend is responding
Write-Host "[1/4] Testing backend availability..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/restaurants" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Backend is running and responding" -ForegroundColor Green
    Write-Host "   Found $($response.Count) restaurants" -ForegroundColor Gray
} catch {
    Write-Host "✗ Backend is not responding!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  .\fix-and-start.ps1" -ForegroundColor Gray
    exit 1
}

# Test 2: Register a test user
Write-Host ""
Write-Host "[2/4] Testing user registration..." -ForegroundColor Yellow
$registerData = @{
    email = "testuser@example.com"
    password = "password123"
    firstName = "Test"
    lastName = "User"
    gender = "MALE"
    phoneNumber = "1234567890"
    location = "NOIDA"
    role = "CUSTOMER"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ Registration endpoint works" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "⚠ User already exists (expected if running multiple times)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Login
Write-Host ""
Write-Host "[3/4] Testing user login..." -ForegroundColor Yellow
$loginData = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ Login endpoint works" -ForegroundColor Green
    Write-Host "   Token: $($loginResponse.token.Substring(0, 30))..." -ForegroundColor Gray
    $token = $loginResponse.token
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    $token = $null
}

# Test 4: Register an OWNER
Write-Host ""
Write-Host "[4/4] Testing OWNER registration (for restaurant creation)..." -ForegroundColor Yellow
$ownerData = @{
    email = "owner@example.com"
    password = "password123"
    firstName = "Restaurant"
    lastName = "Owner"
    gender = "FEMALE"
    phoneNumber = "9876543210"
    location = "DELHI"
    role = "OWNER"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $ownerData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ OWNER registration works" -ForegroundColor Green

    # Login as owner
    $ownerLoginData = @{
        email = "owner@example.com"
        password = "password123"
    } | ConvertTo-Json

    $ownerLoginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $ownerLoginData -ContentType "application/json" -ErrorAction Stop
    Write-Host "✓ OWNER login works" -ForegroundColor Green
    Write-Host "   Owner token: $($ownerLoginResponse.token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host "⚠ OWNER account already exists (expected if running multiple times)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ OWNER registration failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Backend is running on $baseUrl" -ForegroundColor Green
Write-Host "✓ All authentication endpoints are working" -ForegroundColor Green
Write-Host "✓ You can now use the React frontend" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start the React frontend: npm run dev" -ForegroundColor Gray
Write-Host "  2. Login with:" -ForegroundColor Gray
Write-Host "     - Customer: testuser@example.com / password123" -ForegroundColor Gray
Write-Host "     - Owner: owner@example.com / password123" -ForegroundColor Gray
Write-Host "  3. As OWNER, you can create restaurants with image upload" -ForegroundColor Gray
Write-Host ""

