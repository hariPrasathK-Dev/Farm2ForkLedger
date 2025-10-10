#!/usr/bin/env pwsh

Write-Host "🍕 Rich's Pizza Traceability Platform - Complete Setup" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "docker")) {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ NPM is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All prerequisites found" -ForegroundColor Green
Write-Host ""

# Step 1: Start blockchain
Write-Host "🔗 Step 1: Starting blockchain network..." -ForegroundColor Cyan
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start blockchain network" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Blockchain network started" -ForegroundColor Green

# Wait for blockchain to be ready
Write-Host "⏳ Waiting for blockchain to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 2: Deploy smart contract
Write-Host "📄 Step 2: Deploying smart contracts..." -ForegroundColor Cyan
Set-Location "contracts"
npm install 2>$null | Out-Null
npm run deploy:local
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to deploy smart contracts" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Smart contracts deployed" -ForegroundColor Green

# Step 3: Setup complete test environment
Write-Host "🎯 Step 3: Setting up complete test environment..." -ForegroundColor Cyan
npm run setup:complete
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to setup test environment" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Test environment ready" -ForegroundColor Green

# Step 4: Start backend services
Write-Host "🚀 Step 4: Starting backend services..." -ForegroundColor Cyan
Set-Location "../services/indexer-api"
npm install 2>$null | Out-Null

# Start backend in background
Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd '$PWD'; npm start" -WindowStyle Hidden
Start-Sleep -Seconds 5
Write-Host "✅ Backend services started" -ForegroundColor Green

# Step 5: Start frontend
Write-Host "🌐 Step 5: Starting frontend application..." -ForegroundColor Cyan
Set-Location "../../ui"
npm install 2>$null | Out-Null

Write-Host ""
Write-Host "🎉 SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend will open at: http://localhost:3000" -ForegroundColor Yellow
Write-Host "🔗 Blockchain RPC: http://localhost:8545" -ForegroundColor Yellow
Write-Host "📡 Backend API: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 TEST DATA READY:" -ForegroundColor Cyan
Write-Host "   🍕 Pizza Code: PIZZA-MARG-001" -ForegroundColor White
Write-Host "   📦 Shipment: SHIP-MARG-001" -ForegroundColor White
Write-Host "   🏪 Location: Metro Grocery Store #1247" -ForegroundColor White
Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Magenta
Write-Host "1. Frontend will start automatically" -ForegroundColor White
Write-Host "2. Click 'Start Tracing Now' on the homepage" -ForegroundColor White
Write-Host "3. Enter: PIZZA-MARG-001" -ForegroundColor White
Write-Host "4. Explore the complete pizza journey!" -ForegroundColor White
Write-Host "5. Test blockchain verification system" -ForegroundColor White
Write-Host ""
Write-Host "📖 For Remix IDE integration, see:" -ForegroundColor Yellow
Write-Host "   REMIX_INTEGRATION_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Starting frontend..." -ForegroundColor Green

# Start frontend (this will block and show the frontend)
npm start