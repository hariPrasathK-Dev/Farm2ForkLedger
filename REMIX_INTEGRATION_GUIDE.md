# 🎯 Rich's Pizza Traceability - Remix IDE Integration Guide

This guide will help you simulate supply chain entities using Remix IDE while keeping the consumer frontend clean and simple.

## 📋 Prerequisites

1. **Local blockchain running** (Ganache CLI via Docker)
2. **Smart contract deployed** using the deploy script
3. **Backend indexer running** to capture blockchain events
4. **Remix IDE** open in your browser

## 🚀 Quick Setup

### Step 1: Start Your Local Environment

```powershell
# Navigate to project root
cd "c:\Users\hp859\Desktop\BlockChain Projects\richs_pizza_traceability"

# Start the blockchain network
docker-compose up -d

# Deploy the smart contract
cd contracts
npm run deploy:local

# Start the backend indexer
cd ../services/indexer-api
npm start

# Start the frontend (in another terminal)
cd ../ui
npm start
```

### Step 2: Connect Remix IDE to Local Blockchain

1. **Open Remix IDE**: Go to https://remix.ethereum.org
2. **Connect to Local Provider**:

   - Go to "Deploy & Run Transactions" tab
   - In "Environment" dropdown, select "Injected Provider - MetaMask" or "External Http Provider"
   - If using External Http Provider, enter: `http://localhost:8545`

3. **Import Your Contract**:

   - Create new file: `SupplyChain.sol`
   - Copy the contract code from `contracts/contracts/SupplyChain.sol`
   - Compile it (Ctrl+S)

4. **Load Deployed Contract**:
   - In "Deploy & Run Transactions" tab
   - Expand "At Address" section
   - Enter your deployed contract address (from `contracts/deployments/local.json`)
   - Click "At Address" button

## 🎭 Entity Simulation Workflow

### Admin Role (You - Contract Owner)

As the deployer, you automatically have admin privileges. Use these functions first:

```solidity
// 1. Assign roles to different addresses
grantRole(FARMER_ROLE, 0x742d35Cc642C8d9BCA8D0d30CB69cD85c1F04e47)
grantRole(PROCESSOR_ROLE, 0x8ba1f109551bD432803012645Hac136c4dB8c2D0)
grantRole(DISTRIBUTOR_ROLE, 0x617F2E2fD72FD9D5503197092aC168c91465E7f2)
grantRole(RETAILER_ROLE, 0x17F6AD8Ef982297579C203069C1DbfFE4348c372)
```

### Farmer Simulation

Switch to a farmer address and create ingredients:

```solidity
// Create organic tomatoes
createIngredient(
    "ORG-TOM-001",
    "Organic Tomatoes",
    "Fresh organic Roma tomatoes from Johnson Farm",
    "Johnson Organic Farm, California",
    1728518400, // October 2024 timestamp
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

### Processor Simulation

Switch to processor address and create products:

```solidity
// Create a pizza using the ingredients
createProduct(
    "PIZZA-MARG-001",
    "Margherita Pizza",
    "Classic margherita with fresh mozzarella and basil",
    ["ORG-TOM-001", "MOZ-CHZ-001", "DOH-WHT-001"],
    "Rich's Frozen Foods, New York",
    1728604800, // Next day timestamp
    ["Frozen", "Ready-to-Bake", "Artisan"]
)
```

### Distributor Simulation

Switch to distributor address and create shipments:

```solidity
// Create shipment
createShipment(
    "SHIP-001",
    ["PIZZA-MARG-001"],
    "FreshCold Logistics",
    "Rich's Frozen Foods → Metro Grocery Chain",
    1728691200, // Transport date
    -18 // Frozen temperature in Celsius
)
```

### Retailer Simulation

Switch to retailer address and update final location:

```solidity
// Update product location at retail
updateLocation(
    "PIZZA-MARG-001",
    "Metro Grocery Store #1247",
    "123 Main Street, Anytown, State 12345",
    1728777600 // Arrival at store timestamp
)
```

## 🌡️ Temperature Monitoring Simulation

The IoT simulator automatically adds temperature readings. You can also manually add them:

```solidity
// Add temperature reading (any authorized role can do this)
addTemperatureReading(
    "PIZZA-MARG-001",
    -18, // Temperature in Celsius
    75,  // Humidity percentage
    1728864000 // Timestamp
)
```

## 🔍 Consumer Experience Testing

After simulating the supply chain:

1. **Open the frontend**: http://localhost:3000
2. **Click "Start Tracing Now"**
3. **Enter the product code**: `PIZZA-MARG-001`
4. **See the complete journey** from farm to store
5. **Verify blockchain authenticity** using the verification buttons

## 📊 Address Management

Keep track of your simulation addresses:

```javascript
// Ganache provides these default addresses:
const addresses = {
  admin: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57", // You (deployer)
  farmer: "0xf17f52151EbEF6C7334FAD080c5704D77216b732", // Farmer
  processor: "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef", // Processor
  distributor: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544", // Distributor
  retailer: "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2", // Retailer
};
```

## 🛠️ Useful Remix Functions

### Check Roles

```solidity
hasRole(FARMER_ROLE, 0x742d35Cc642C8d9BCA8D0d30CB69cD85c1F04e47)
hasRole(ADMIN_ROLE, YOUR_ADDRESS)
```

### Get Product Details

```solidity
getProduct("PIZZA-MARG-001")
getProductHistory("PIZZA-MARG-001")
getTemperatureReadings("PIZZA-MARG-001")
```

### Emergency Controls (Admin Only)

```solidity
pauseContract()    // Pause all operations
unpauseContract()  // Resume operations
```

## 🔄 Complete Simulation Flow

1. **Deploy Contract** → You become admin automatically
2. **Assign Roles** → Grant roles to different addresses
3. **Create Ingredients** → Switch to farmer address, create ingredients
4. **Process Products** → Switch to processor, combine ingredients into products
5. **Create Shipments** → Switch to distributor, create shipments
6. **Update Retail Location** → Switch to retailer, update final location
7. **Add Temperature Data** → IoT simulator runs automatically
8. **Test Consumer Experience** → Use frontend to trace products

## 🎯 Pro Tips

- **Use different browser profiles** or **MetaMask accounts** for each role
- **Copy transaction hashes** to verify in blockchain explorer
- **Check the indexer logs** to see events being captured
- **Use the verification system** to prove data authenticity
- **Screenshot the consumer journey** to showcase the complete experience

## 🚨 Troubleshooting

- **Contract not found**: Check the address in `deployments/local.json`
- **Role errors**: Make sure you've granted the correct role to the active address
- **Connection issues**: Verify Ganache is running on `localhost:8545`
- **Transaction failures**: Check you have sufficient ETH in the active account

## 📝 Next Steps

Once you've simulated the complete flow:

1. Take screenshots of the consumer experience
2. Document the blockchain transactions
3. Show the verification system working
4. Demonstrate temperature monitoring
5. Showcase the complete farm-to-table story

Your Rich's Pizza Traceability platform is now ready for demonstration! 🍕✨
