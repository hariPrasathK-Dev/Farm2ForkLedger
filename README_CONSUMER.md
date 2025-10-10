# 🍕 Rich's Pizza Traceability Platform

A blockchain-powered consumer application that lets customers trace their Rich's Pizza journey from farm to table.

## 🎯 What This Platform Does

- **For Consumers**: Beautiful, simple interface to trace pizza ingredients and journey
- **For Developers**: Complete supply chain simulation tools using Remix IDE
- **For Business**: Blockchain-verified authenticity and transparency

## 🚀 Quick Start (One Command Setup)

```powershell
# Run this single command to start everything:
.\start-platform.ps1
```

This will:

1. ✅ Start the blockchain network
2. ✅ Deploy smart contracts
3. ✅ Create realistic test data
4. ✅ Start backend services
5. ✅ Launch the consumer frontend

## 🌐 Consumer Experience

Once started, consumers can:

- Visit **http://localhost:3000**
- Click **"Start Tracing Now"**
- Enter pizza code: **`PIZZA-MARG-001`**
- See the complete farm-to-table journey with blockchain verification

## 🎭 Developer Simulation (Remix IDE)

Use **Remix IDE** to simulate supply chain entities:

- **Contract Address**: Found in `contracts/deployments/local.json`
- **Blockchain RPC**: `http://localhost:8545`
- **Complete Guide**: `REMIX_INTEGRATION_GUIDE.md`

### Quick Remix Setup:

1. Open https://remix.ethereum.org
2. Connect to `http://localhost:8545`
3. Load contract at deployed address
4. Simulate farmers, processors, distributors, and retailers

## 📁 Project Structure

```
richs_pizza_traceability/
├── blockchain/           # Ganache blockchain network
├── contracts/           # Solidity smart contracts
├── services/
│   └── indexer-api/    # Node.js backend + blockchain indexer
├── ui/                 # React consumer frontend
├── REMIX_INTEGRATION_GUIDE.md  # Complete Remix guide
└── start-platform.ps1         # One-command startup
```

## 🛠️ Manual Setup (If Needed)

If the automated script doesn't work:

### 1. Start Blockchain

```powershell
docker-compose up -d
```

### 2. Deploy Contracts

```powershell
cd contracts
npm install
npm run deploy:local
npm run setup:complete
```

### 3. Start Backend

```powershell
cd services/indexer-api
npm install
npm start
```

### 4. Start Frontend

```powershell
cd ui
npm install
npm start
```

## 🎯 Test Scenarios

The platform comes with pre-loaded test data:

### 🍕 **Rich's Margherita Pizza** (`PIZZA-MARG-001`)

- **Ingredients**: Organic tomatoes, mozzarella, pizza dough
- **Journey**: Johnson Farm → Green Valley Dairy → Heritage Mills → Rich's Processing → FreshCold Logistics → Metro Grocery
- **Temperature**: Monitored throughout cold chain
- **Verification**: All steps blockchain-verified

## 🔍 Features Demonstrated

- ✅ **Complete traceability** from farm to consumer
- ✅ **Blockchain verification** for data authenticity
- ✅ **Temperature monitoring** throughout cold chain
- ✅ **Consumer-friendly interface** with beautiful UX
- ✅ **Developer simulation tools** via Remix IDE
- ✅ **Role-based access control** for supply chain entities
- ✅ **Real-time indexing** of blockchain events

## 🏗️ Architecture

- **Blockchain**: Ganache CLI (Ethereum-compatible)
- **Smart Contracts**: Solidity 0.8.19 with OpenZeppelin RBAC
- **Backend**: Node.js + Express + PostgreSQL + Web3
- **Frontend**: React + Material-UI + MetaMask integration
- **Simulation**: Remix IDE integration for entity management

## 🎨 Consumer-First Design

The interface focuses entirely on the consumer experience:

- **Beautiful pizza-themed homepage**
- **Simple QR code / lot code entry**
- **Visual journey storytelling**
- **Trust indicators and verification**
- **Mobile-responsive design**

## 📈 Business Value

- **Consumer Trust**: Blockchain-verified transparency
- **Brand Differentiation**: First-to-market traceability
- **Compliance**: Full audit trail for regulations
- **Marketing**: Share authentic farm-to-table stories
- **Quality Assurance**: Temperature monitoring and alerts

## 🎯 Next Steps

1. **Demo the Platform**: Use the test pizza code `PIZZA-MARG-001`
2. **Simulate New Products**: Use Remix IDE to create new supply chains
3. **Customize Branding**: Update UI colors, logos, and messaging
4. **Add Real IoT**: Connect actual temperature sensors
5. **Deploy Production**: Use Hyperledger Besu for enterprise blockchain

---

## 🆘 Troubleshooting

- **Port conflicts**: Make sure ports 3000, 5000, 8545 are available
- **Docker issues**: Ensure Docker Desktop is running
- **MetaMask connection**: Add localhost:8545 as custom RPC
- **Build errors**: Delete node_modules and run `npm install`

## 📞 Support

Check these files for detailed guidance:

- `REMIX_INTEGRATION_GUIDE.md` - Complete Remix IDE setup
- `SETUP_GUIDE.md` - Detailed technical setup
- `contracts/test-environment-data.json` - Test data reference

---

**🍕 Rich's Pizza Traceability - From Farm to Fork, Verified by Blockchain** ✨
