# Rich's Pizza Blockchain Traceability Platform

A comprehensive blockchain-based supply chain traceability solution built with Hyperledger Besu, Solidity smart contracts, Node.js backend, React frontend, and Python IoT simulation.

## 🎯 **For Quick Consumer Demo**: See `README_CONSUMER.md`

**Just want to see it working?** Run: `.\start-platform.ps1` and visit http://localhost:3000

## 🎭 **For Supply Chain Simulation**: See `REMIX_INTEGRATION_GUIDE.md`

**Want to simulate entities?** Use Remix IDE to manage farmers, processors, distributors, and retailers.

## 🏗️ Architecture Overview

### Components

- **Blockchain Network**: Hyperledger Besu with IBFT 2.0 consensus
- **Smart Contracts**: Solidity contracts with OpenZeppelin RBAC
- **Backend API**: Node.js Express server with blockchain indexer
- **Frontend**: React application with Material-UI
- **IoT Simulator**: Python temperature monitoring simulation
- **Database**: PostgreSQL for off-chain data indexing

### Key Features

- ✅ End-to-end supply chain traceability
- ✅ Role-based access control (RBAC)
- ✅ Private transactions with Tessera
- ✅ Real-time temperature monitoring
- ✅ Interactive traceability visualization
- ✅ Consumer and enterprise dashboards

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.9+
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd richs_pizza_traceability

# Copy environment files
cp contracts/.env.example contracts/.env
cp services/indexer-api/.env.example services/indexer-api/.env
cp ui/.env.example ui/.env
```

### 2. Start Blockchain Network

```bash
cd blockchain
docker-compose up -d

# Wait for network to initialize (30-60 seconds)
docker-compose logs -f besu-node1
```

### 3. Deploy Smart Contracts

```bash
cd contracts
npm install
npm run deploy:besu

# Copy contract address from output to .env files
```

### 4. Start Backend Services

```bash
cd services/indexer-api
npm install
npm start
```

### 5. Start Frontend

```bash
cd ui
npm install
npm start
```

### 6. Generate Demo Data (Optional)

```bash
cd services/iot-simulator
pip install -r requirements.txt
python demo_generator.py
```

## 📖 Usage Guide

### For Consumers

1. Visit `http://localhost:3000`
2. Go to "Trace Product"
3. Enter a lot code (try: `PZ123456`)
4. View complete supply chain journey

### For Supply Chain Partners

1. Connect your MetaMask wallet
2. Ensure you have the correct role assigned
3. Use the Dashboard to:
   - Create ingredients (Farmers)
   - Combine items (Manufacturers)
   - Ship products (Logistics)
   - Receive items (All roles)

### For Administrators

1. Connect with admin wallet
2. Access Admin Dashboard
3. Manage user roles and permissions
4. Monitor system health

## 🔧 Configuration

### Network Configuration

- **Chain ID**: 2024
- **Consensus**: IBFT 2.0
- **Block Time**: 5 seconds
- **Validators**: 4 nodes

### Default Accounts

```
Admin:        0x627306090abaB3A6e1400e9345bC60c78a8BEf57
Farmer:       0xf17f52151EbEF6C7334FAD080c5704D77216b732
Manufacturer: 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef
Logistics:    0x821aEa9a577a9b44299B9c15c88cf3087F3b5544
Retailer:     0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2
```

### API Endpoints

- **Health**: `GET /health`
- **Traceability**: `GET /api/traceability/:lotCode`
- **Items**: `GET /api/items/:itemId`
- **Transactions**: `POST /api/transactions/*`

## 🧪 Testing

### End-to-End Test Scenario

1. **Setup Roles** (Admin)

   - Grant FARMER_ROLE to test account
   - Grant MANUFACTURER_ROLE to another account

2. **Create Ingredient** (Farmer)

   - Product ID: "Organic Flour"
   - Lot Code: "FL001234"
   - Location: "Green Valley Farm"

3. **Combine Items** (Manufacturer)

   - New Product: "Pizza Dough"
   - Parent Items: [FL001234]
   - Location: "Rich's Factory"

4. **Trace Product** (Consumer)
   - Enter lot code for Pizza Dough
   - Verify traceability tree shows Organic Flour

### Unit Tests

```bash
# Smart Contracts
cd contracts
npm test

# Backend API
cd services/indexer-api
npm test

# Frontend
cd ui
npm test
```

## 📊 Monitoring

### Blockchain Network

```bash
# View node logs
docker-compose logs -f besu-node1

# Check node status
curl http://localhost:8545 -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### Database

```bash
# Connect to PostgreSQL
docker exec -it richs_pizza_postgres psql -U richs_user -d richs_pizza_traceability

# Check indexer progress
SELECT * FROM indexer_state;
SELECT COUNT(*) FROM items;
```

### API Health

```bash
curl http://localhost:3001/health
```

## 🔐 Security

### Smart Contract Security

- Uses OpenZeppelin libraries
- Role-based access control
- Reentrancy protection
- Input validation

### Network Security

- Private permissioned network
- Tessera for transaction privacy
- IBFT 2.0 Byzantine fault tolerance

### API Security

- CORS protection
- Rate limiting
- Input validation
- Environment variables for secrets

## 🐛 Troubleshooting

### Common Issues

**Blockchain Network Won't Start**

```bash
# Clean containers and volumes
docker-compose down -v
docker system prune -f
docker-compose up -d
```

**Contract Deployment Fails**

- Ensure network is running
- Check account has sufficient balance
- Verify RPC URL is correct

**Frontend Connection Issues**

- Add Besu network to MetaMask
- Check CONTRACT_ADDRESS in .env
- Ensure API server is running

**Database Connection Errors**

```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

## 📁 Project Structure

```
richs_pizza_traceability/
├── blockchain/                 # Docker Compose & network config
│   ├── docker-compose.yml
│   ├── genesis.json
│   ├── keys/                  # Node private keys
│   └── tessera/               # Private transaction manager
├── contracts/                 # Solidity smart contracts
│   ├── SupplyChain.sol
│   ├── hardhat.config.js
│   └── scripts/deploy.js
├── services/
│   ├── indexer-api/          # Node.js backend
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── indexer/
│   │   │   └── database/
│   │   └── package.json
│   └── iot-simulator/        # Python temperature simulation
│       ├── simulate_temperature.py
│       └── demo_generator.py
├── ui/                       # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── contexts/
│   └── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ for transparent and secure supply chains**
