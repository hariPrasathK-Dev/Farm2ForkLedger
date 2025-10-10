# 🍕 Rich's Pizza Blockchain Traceability Platform

A comprehensive blockchain-powered consumer application that lets customers trace their Rich's Pizza journey from farm to table, with complete supply chain simulation tools for developers.

## 🎯 What This Platform Does

- **For Consumers**: Beautiful, simple interface to trace pizza ingredients and journey
- **For Developers**: Complete supply chain simulation tools using Remix IDE  
- **For Business**: Blockchain-verified authenticity and transparency

---

## 🚀 Quick Start (One Command Setup)

```powershell
# Run this single command to start everything:
.\start-platform.ps1
```

This automated setup will:
1. ✅ Start the Ganache blockchain network
2. ✅ Deploy smart contracts with clean admin-only setup
3. ✅ Create realistic test data (pizza, ingredients, journey)
4. ✅ Start backend indexer services
5. ✅ Launch the consumer frontend

**Result**: Visit **http://localhost:3000** and enter test code **`PIZZA-MARG-001`** to see the complete farm-to-table journey!

---

## 🏗️ Architecture & Components

### Core Components
- **Blockchain Network**: Ganache CLI (Ethereum-compatible) via Docker
- **Smart Contracts**: Solidity 0.8.19 with OpenZeppelin RBAC
- **Backend API**: Node.js Express server with PostgreSQL + blockchain indexer
- **Frontend**: React with Material-UI, consumer-focused design
- **Developer Tools**: Remix IDE integration for supply chain simulation

### Key Features
- ✅ End-to-end supply chain traceability with blockchain verification
- ✅ Role-based access control (Admin, Farmer, Processor, Distributor, Retailer)
- ✅ Real-time temperature monitoring throughout cold chain
- ✅ Consumer-friendly interface with beautiful pizza-themed design
- ✅ Complete entity simulation via Remix IDE
- ✅ Automatic blockchain event indexing for fast queries

---

## 📁 Project Structure

```
richs_pizza_traceability/
├── blockchain/                    # Ganache blockchain network configuration
│   ├── docker-compose.yml        # Blockchain network setup
│   └── keys/                     # Pre-configured node keys
├── contracts/                     # Solidity smart contracts
│   ├── contracts/SupplyChain.sol # Main smart contract with RBAC
│   ├── scripts/deploy.js         # Clean admin-only deployment
│   ├── scripts/setup-complete-environment.js # Full test data setup
│   └── deployments/              # Contract addresses and ABIs
├── services/
│   └── indexer-api/              # Node.js backend + blockchain indexer
│       ├── src/index.js          # Express API server
│       ├── src/indexer/          # Blockchain event indexer
│       └── src/routes/           # API endpoints + verification system
├── ui/                           # React consumer frontend
│   ├── src/pages/Home.js         # Consumer-focused pizza-themed homepage
│   ├── src/pages/TraceabilityPortal.js # Pizza journey visualization
│   └── src/components/           # UI components
└── start-platform.ps1           # One-command startup script
```

---

## 🌐 Consumer Experience

### How Consumers Use the Platform:
1. **Visit**: http://localhost:3000
2. **Find**: QR code or lot code on Rich's Pizza packaging
3. **Enter**: Pizza code (e.g., `PIZZA-MARG-001`)
4. **Explore**: Complete farm-to-table journey with blockchain verification
5. **Verify**: Click verification buttons to confirm data authenticity

### Consumer Interface Features:
- 🍕 **Beautiful pizza-themed homepage** with warm, inviting design
- 📱 **Mobile-responsive** QR code scanning interface
- 🔍 **Simple lot code entry** for easy traceability
- 📊 **Visual journey timeline** showing each step from farm to table
- ✅ **Trust indicators** and blockchain verification buttons
- 🌡️ **Temperature monitoring** display for cold chain integrity

---

## 🎭 Developer Simulation (Remix IDE Integration)

### Why Use Remix IDE?
- **You (the developer)** simulate all supply chain entities
- **Consumers** only use the beautiful frontend
- **Complete separation** between entity management and consumer experience

### Quick Remix Setup:

1. **Open Remix IDE**: https://remix.ethereum.org
2. **Connect to Local Blockchain**:
   - Go to "Deploy & Run Transactions" tab
   - Select "External Http Provider" 
   - Enter: `http://localhost:8545`

3. **Load Your Contract**:
   - Create new file: `SupplyChain.sol`
   - Copy contract code from `contracts/contracts/SupplyChain.sol`
   - Compile it (Ctrl+S)
   - In "At Address" section, enter your deployed contract address
   - (Find address in `contracts/deployments/local.json`)

### Entity Simulation Workflow:

#### 1. **Admin Role (You - Contract Owner)**
As the deployer, you automatically have admin privileges:

```solidity
// Assign roles to different Ganache addresses
grantRole(FARMER_ROLE, 0xf17f52151EbEF6C7334FAD080c5704D77216b732)
grantRole(PROCESSOR_ROLE, 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef)
grantRole(DISTRIBUTOR_ROLE, 0x821aEa9a577a9b44299B9c15c88cf3087F3b5544)
grantRole(RETAILER_ROLE, 0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2)
```

#### 2. **Farmer Simulation**
Switch to farmer address and create ingredients:

```solidity
// Create organic tomatoes
createIngredient(
    "ORG-TOM-001",
    "Organic Tomatoes", 
    "Fresh organic Roma tomatoes from Johnson Farm",
    "Johnson Organic Farm, California",
    1728518400,
    ["Organic", "Non-GMO", "Pesticide-Free"]
)

// Create mozzarella cheese  
createIngredient(
    "MOZ-CHZ-001",
    "Mozzarella Cheese",
    "Fresh mozzarella from grass-fed cows", 
    "Green Valley Dairy, Wisconsin",
    1728518400,
    ["Organic", "Grass-Fed", "Hormone-Free"]  
)

// Create pizza dough
createIngredient(
    "DOH-WHT-001", 
    "Pizza Dough",
    "Organic wheat flour pizza dough",
    "Heritage Mills, Kansas", 
    1728518400,
    ["Organic", "Stone-Ground", "Ancient-Grains"]
)
```

#### 3. **Processor Simulation**
Switch to processor address and create products:

```solidity
// Create a pizza using the ingredients
createProduct(
    "PIZZA-MARG-001",
    "Rich's Margherita Pizza",
    "Classic margherita with fresh mozzarella, organic tomatoes, and artisan dough",
    ["ORG-TOM-001", "MOZ-CHZ-001", "DOH-WHT-001"],
    "Rich's Frozen Foods, Buffalo, NY",
    1728604800,
    ["Frozen", "Ready-to-Bake", "Artisan", "Organic"]
)
```

#### 4. **Distributor Simulation**
Switch to distributor address and create shipments:

```solidity
// Create shipment
createShipment(
    "SHIP-MARG-001",
    ["PIZZA-MARG-001"],
    "FreshCold Logistics Inc.",
    "Rich's Frozen Foods → Metro Grocery Distribution Center",
    1728691200,
    -18 // Frozen temperature in Celsius
)
```

#### 5. **Retailer Simulation**  
Switch to retailer address and update final location:

```solidity
// Update product location at retail
updateLocation(
    "PIZZA-MARG-001",
    "Metro Grocery Store #1247",
    "123 Main Street, Anytown, NY 12345", 
    1728777600
)
```

#### 6. **Temperature Monitoring**
Any authorized role can add temperature readings:

```solidity
// Add temperature reading
addTemperatureReading(
    "PIZZA-MARG-001",
    -18, // Temperature in Celsius
    75,  // Humidity percentage  
    1728864000 // Timestamp
)
```

### Address Management for Simulation:

```javascript
// Ganache provides these default addresses:
const addresses = {
  admin: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",      // You (deployer)
  farmer: "0xf17f52151EbEF6C7334FAD080c5704D77216b732",     // Farmer entity
  processor: "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef", // Processor entity
  distributor: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544", // Distributor entity
  retailer: "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2"    // Retailer entity
};
```

---

## 🛠️ Manual Setup (If Automated Script Fails)

### Prerequisites:
- Docker & Docker Compose
- Node.js 18+  
- PowerShell (Windows)

### Step-by-Step Setup:

#### 1. Start Blockchain Network
```powershell
docker-compose up -d
# Wait for Ganache to be ready on localhost:8545
```

#### 2. Deploy Smart Contracts  
```powershell
cd contracts
npm install
npm run deploy:local        # Deploy with clean admin-only setup
npm run setup:complete      # Create realistic test data
```

#### 3. Start Backend Services
```powershell  
cd ../services/indexer-api
npm install
npm start                   # Starts on localhost:5000
```

#### 4. Start Frontend Application
```powershell
cd ../../ui  
npm install
npm start                   # Starts on localhost:3000
```

---

## 🎯 Pre-Loaded Test Scenarios

The platform comes with realistic test data ready for demonstration:

### 🍕 **Rich's Margherita Pizza** (`PIZZA-MARG-001`)

**Complete Journey**:
- **Ingredients**: 
  - Organic Tomatoes (ORG-TOM-001) from Johnson Organic Farm, California
  - Mozzarella Cheese (MOZ-CHZ-001) from Green Valley Dairy, Wisconsin  
  - Pizza Dough (DOH-WHT-001) from Heritage Mills, Kansas
- **Processing**: Rich's Frozen Foods, Buffalo, NY
- **Distribution**: FreshCold Logistics Inc.
- **Retail**: Metro Grocery Store #1247, Anytown, NY
- **Temperature**: 6 monitoring points throughout cold chain (-18°C)
- **Verification**: All steps blockchain-verified with trust scores

**To Test**: Enter `PIZZA-MARG-001` in the frontend traceability portal

---

## 🔍 Technical Features Demonstrated

### Blockchain Verification System:
- ✅ **Data Authenticity**: Compare database vs blockchain records
- ✅ **Trust Scoring**: Automatic verification with percentage scores  
- ✅ **Tamper Detection**: Identify any data inconsistencies
- ✅ **Batch Verification**: Verify multiple records simultaneously

### Consumer-Focused Design:
- ✅ **Pizza-themed Interface**: Warm colors, food imagery, consumer messaging
- ✅ **Simple Navigation**: Two-button approach (QR scan or manual entry)
- ✅ **Mobile Responsive**: Works perfectly on phones and tablets  
- ✅ **Trust Indicators**: Clear verification status and confidence scores

### Developer Simulation Tools:
- ✅ **Complete Entity Simulation**: All supply chain roles via Remix IDE
- ✅ **Role-Based Access Control**: Proper permission management
- ✅ **Realistic Test Data**: Pre-loaded pizza journey for immediate demo
- ✅ **Event Indexing**: Real-time blockchain event capture and database sync

---

## 🚨 Troubleshooting

### Common Issues & Solutions:

**Port Conflicts**: 
- Ensure ports 3000, 5000, 8545 are available
- Kill processes: `Get-Process -Name "node" | Stop-Process -Force`

**Docker Issues**:
- Ensure Docker Desktop is running  
- Restart: `docker-compose down && docker-compose up -d`

**Contract Connection**:
- Verify contract address in `contracts/deployments/local.json`
- Check Ganache is running: `curl http://localhost:8545`

**MetaMask Connection**:
- Add custom RPC: `http://localhost:8545`, Chain ID: `1337`
- Import Ganache private keys for testing

**Build Errors**:
- Clear caches: `rm -rf node_modules package-lock.json`
- Fresh install: `npm install`

---

## 🎯 Demo Flow & Testing

### Complete Demonstration Steps:

1. **Setup**: Run `.\start-platform.ps1` (one command does everything)
2. **Consumer Test**: Visit http://localhost:3000, enter `PIZZA-MARG-001`
3. **Journey Exploration**: See farm → processing → distribution → retail
4. **Verification**: Click verification buttons to prove blockchain authenticity
5. **Developer Simulation**: Use Remix IDE to create new products and journeys
6. **Temperature Monitoring**: View cold chain integrity throughout journey

### Success Indicators:
- ✅ Frontend loads with beautiful pizza-themed homepage
- ✅ Test pizza code shows complete journey with all steps
- ✅ Verification system shows 100% trust scores
- ✅ Temperature readings display properly
- ✅ Remix IDE connects and can call contract functions
- ✅ New products created in Remix appear in frontend

---

## 📈 Business Value

### For Rich's Pizza:
- **Consumer Trust**: Blockchain-verified transparency builds confidence
- **Brand Differentiation**: First-to-market traceability in frozen pizza industry  
- **Quality Assurance**: Temperature monitoring prevents spoilage
- **Marketing Stories**: Share authentic farm-to-table narratives
- **Compliance**: Full audit trail for food safety regulations

### For Supply Chain Partners:
- **Accountability**: All actions permanently recorded on blockchain
- **Efficiency**: Automated verification reduces manual audits
- **Transparency**: Clear visibility into entire supply chain
- **Risk Management**: Quick identification of quality issues

---

## 🚀 Ready to Use!

Your Rich's Pizza Traceability platform is now **completely ready** for demonstration:

1. **Consumer Experience**: Beautiful, simple, mobile-friendly interface
2. **Developer Tools**: Complete Remix IDE integration for entity simulation  
3. **Realistic Data**: Pre-loaded pizza journey from farm to table
4. **Blockchain Verification**: Tamper-proof authenticity system
5. **One-Command Setup**: Fully automated deployment and testing

**Just run**: `.\start-platform.ps1` and visit http://localhost:3000

**Enter code**: `PIZZA-MARG-001` to see the magic! 🍕✨

---

*Rich's Pizza Traceability Platform - From Farm to Fork, Verified by Blockchain*