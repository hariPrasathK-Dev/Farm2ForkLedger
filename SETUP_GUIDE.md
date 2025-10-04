# Alternative Setup Guide

## Option 1: Docker Desktop (Recommended for Full Features)

### Fix Docker Desktop Issue:

1. **Start Docker Desktop manually:**

   - Press `Win + R`, type `Docker Desktop`, press Enter
   - Wait for Docker Desktop to fully load (whale icon in system tray)
   - Check if the Docker Desktop status shows "Engine running"

2. **If Docker Desktop won't start:**

   ```powershell
   # Restart Docker Desktop service
   Stop-Service -Name "com.docker.service" -Force
   Start-Service -Name "com.docker.service"

   # Or restart your computer and try again
   ```

3. **Once Docker Desktop is running:**

   ```powershell
   cd .\blockchain\

   # Use the simplified version first
   docker-compose -f docker-compose-simple.yml up -d

   # Check if containers are running
   docker ps
   ```

## Option 2: Local Development Setup (No Docker Required)

### Prerequisites:

- Node.js 18+
- PostgreSQL 12+
- Python 3.9+

### 1. Setup PostgreSQL Database:

```powershell
# Install PostgreSQL if not already installed
# Create database manually or use cloud provider like AWS RDS, Azure Database, etc.

# Connection details:
# Host: localhost
# Port: 5432
# Database: richs_pizza_traceability
# Username: richs_user
# Password: richs_password
```

### 2. Setup Mock Blockchain (for development):

```powershell
cd .\contracts\
npm install
npm install -g ganache-cli

# Start local blockchain
ganache-cli --deterministic --accounts 10 --host 0.0.0.0 --port 8545
```

### 3. Deploy Contracts:

```powershell
# In a new terminal
cd .\contracts\
npm run deploy:local
```

### 4. Start Backend Services:

```powershell
cd .\services\indexer-api\

# Copy and edit environment file
cp .env.example .env

# Edit .env file with your database connection
# DB_HOST=localhost
# DB_PORT=5432
# BESU_RPC_URL=http://localhost:8545

npm install
npm start
```

### 5. Start Frontend:

```powershell
cd .\ui\
cp .env.example .env

# Edit .env file with contract address from deployment

npm install
npm start
```

## Option 3: Cloud Development Environment

### Use GitHub Codespaces or similar:

1. Fork the repository to your GitHub account
2. Create a new Codespace
3. All dependencies will be pre-installed
4. Follow the setup instructions

## Troubleshooting Docker Issues:

### Common Docker Desktop Problems:

1. **WSL 2 not enabled:**

   ```powershell
   # Enable WSL 2
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

   # Restart computer and update WSL
   wsl --update
   wsl --set-default-version 2
   ```

2. **Hyper-V Issues:**

   - Enable Hyper-V in Windows Features
   - Or use WSL 2 backend instead

3. **Resource Issues:**
   - Increase Docker Desktop memory allocation
   - Close other resource-intensive applications

### Alternative: Use Docker Toolbox (Legacy)

If Docker Desktop continues to fail, you can install Docker Toolbox for older Windows versions.

## Quick Start Commands:

### Once Docker is Working:

```powershell
# Start simplified blockchain
cd .\blockchain\
docker-compose -f docker-compose-simple.yml up -d

# Wait 30 seconds for network to initialize
docker-compose -f docker-compose-simple.yml logs besu-node1

# Deploy contracts
cd ..\contracts\
npm install
npm run deploy:local

# Start backend
cd ..\services\indexer-api\
npm install
npm start

# Start frontend (new terminal)
cd ..\..\ui\
npm install
npm start
```

### Verify Setup:

1. Visit http://localhost:3000 (Frontend)
2. Check http://localhost:3001/health (API)
3. Test blockchain: `curl http://localhost:8545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`

## Next Steps:

Once you have the basic setup working, you can gradually add:

1. Additional Besu validator nodes
2. Tessera privacy layer
3. Advanced monitoring
4. Production configurations
