const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(
    "🚀 Setting up complete Rich's Pizza Traceability testing environment...\n"
  );

  // Get all signers (different addresses for different roles)
  const signers = await ethers.getSigners();

  if (signers.length < 5) {
    console.error(
      `❌ Need at least 5 accounts, but only found ${signers.length}`
    );
    console.error("💡 Make sure Ganache is running with --accounts 10");
    console.error("💡 Run: docker-compose up -d (from project root)");
    return;
  }

  const [admin, farmer, processor, distributor, retailer] = signers;

  console.log("👥 Address Setup:");
  console.log(`📋 Admin (You): ${admin.address}`);
  console.log(`🌾 Farmer: ${farmer.address}`);
  console.log(`🏭 Processor: ${processor.address}`);
  console.log(`🚚 Distributor: ${distributor.address}`);
  console.log(`🏪 Retailer: ${retailer.address}\n`);

  // Load deployed contract
  const deploymentPath = path.join(__dirname, "../deployments/local.json");
  if (!fs.existsSync(deploymentPath)) {
    console.error(
      "❌ Contract not deployed. Please run 'npm run deploy:local' first."
    );
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const contract = SupplyChain.attach(deployment.contractAddress);

  console.log(`📄 Contract Address: ${deployment.contractAddress}\n`);

  // Step 1: Assign roles
  console.log("🎯 Step 1: Assigning roles...");

  const FARMER_ROLE = await contract.FARMER_ROLE();
  const PROCESSOR_ROLE = await contract.PROCESSOR_ROLE();
  const DISTRIBUTOR_ROLE = await contract.DISTRIBUTOR_ROLE();
  const RETAILER_ROLE = await contract.RETAILER_ROLE();

  await contract.connect(admin).grantRole(FARMER_ROLE, farmer.address);
  console.log("   ✅ Farmer role assigned");

  await contract.connect(admin).grantRole(PROCESSOR_ROLE, processor.address);
  console.log("   ✅ Processor role assigned");

  await contract
    .connect(admin)
    .grantRole(DISTRIBUTOR_ROLE, distributor.address);
  console.log("   ✅ Distributor role assigned");

  await contract.connect(admin).grantRole(RETAILER_ROLE, retailer.address);
  console.log("   ✅ Retailer role assigned\n");

  // Step 2: Create ingredients (as farmer)
  console.log("🌾 Step 2: Creating ingredients...");

  const currentTimestamp = Math.floor(Date.now() / 1000);

  await contract.connect(farmer).createIngredient(
    "ORG-TOM-001",
    "Organic Tomatoes",
    "Fresh organic Roma tomatoes from Johnson Farm",
    "Johnson Organic Farm, California",
    currentTimestamp - 86400, // 1 day ago
    ["Organic", "Non-GMO", "Pesticide-Free"]
  );
  console.log("   🍅 Organic Tomatoes created (ORG-TOM-001)");

  await contract
    .connect(farmer)
    .createIngredient(
      "MOZ-CHZ-001",
      "Mozzarella Cheese",
      "Fresh mozzarella from grass-fed cows",
      "Green Valley Dairy, Wisconsin",
      currentTimestamp - 86400,
      ["Organic", "Grass-Fed", "Hormone-Free"]
    );
  console.log("   🧀 Mozzarella Cheese created (MOZ-CHZ-001)");

  await contract
    .connect(farmer)
    .createIngredient(
      "DOH-WHT-001",
      "Pizza Dough",
      "Organic wheat flour pizza dough",
      "Heritage Mills, Kansas",
      currentTimestamp - 86400,
      ["Organic", "Stone-Ground", "Ancient-Grains"]
    );
  console.log("   🍞 Pizza Dough created (DOH-WHT-001)\n");

  // Step 3: Create product (as processor)
  console.log("🏭 Step 3: Creating pizza product...");

  await contract.connect(processor).createProduct(
    "PIZZA-MARG-001",
    "Rich's Margherita Pizza",
    "Classic margherita with fresh mozzarella, organic tomatoes, and artisan dough",
    ["ORG-TOM-001", "MOZ-CHZ-001", "DOH-WHT-001"],
    "Rich's Frozen Foods, Buffalo, NY",
    currentTimestamp - 43200, // 12 hours ago
    ["Frozen", "Ready-to-Bake", "Artisan", "Organic"]
  );
  console.log("   🍕 Rich's Margherita Pizza created (PIZZA-MARG-001)\n");

  // Step 4: Create shipment (as distributor)
  console.log("🚚 Step 4: Creating shipment...");

  await contract.connect(distributor).createShipment(
    "SHIP-MARG-001",
    ["PIZZA-MARG-001"],
    "FreshCold Logistics Inc.",
    "Rich's Frozen Foods → Metro Grocery Distribution Center",
    currentTimestamp - 21600, // 6 hours ago
    -18 // Frozen temperature
  );
  console.log("   📦 Shipment created (SHIP-MARG-001)\n");

  // Step 5: Update retail location (as retailer)
  console.log("🏪 Step 5: Updating retail location...");

  await contract.connect(retailer).updateLocation(
    "PIZZA-MARG-001",
    "Metro Grocery Store #1247",
    "123 Main Street, Anytown, NY 12345",
    currentTimestamp - 3600 // 1 hour ago
  );
  console.log("   🏪 Product location updated to retail store\n");

  // Step 6: Add temperature readings
  console.log("🌡️ Step 6: Adding temperature monitoring data...");

  // Add some historical temperature readings
  const tempReadings = [
    { temp: -18, humidity: 75, timeOffset: -21600 }, // 6 hours ago (shipping)
    { temp: -17, humidity: 73, timeOffset: -18000 }, // 5 hours ago
    { temp: -18, humidity: 76, timeOffset: -14400 }, // 4 hours ago
    { temp: -19, humidity: 74, timeOffset: -10800 }, // 3 hours ago
    { temp: -18, humidity: 75, timeOffset: -7200 }, // 2 hours ago
    { temp: -18, humidity: 77, timeOffset: -3600 }, // 1 hour ago (at store)
  ];

  for (let i = 0; i < tempReadings.length; i++) {
    const reading = tempReadings[i];
    await contract
      .connect(distributor)
      .addTemperatureReading(
        "PIZZA-MARG-001",
        reading.temp,
        reading.humidity,
        currentTimestamp + reading.timeOffset
      );
    console.log(
      `   🌡️ Temperature reading ${i + 1}/6 added: ${reading.temp}°C, ${
        reading.humidity
      }% humidity`
    );
  }

  console.log("\n🎉 Complete testing environment setup successful!\n");

  // Summary for user
  console.log("📋 SUMMARY FOR REMIX IDE TESTING:");
  console.log("=====================================");
  console.log(`🔗 Contract Address: ${deployment.contractAddress}`);
  console.log(`🍕 Pizza Product Code: PIZZA-MARG-001`);
  console.log(`📦 Shipment Code: SHIP-MARG-001`);
  console.log(`🏪 Final Location: Metro Grocery Store #1247`);
  console.log(`🌡️ Temperature Readings: 6 entries from shipping to store`);
  console.log("\n🎯 NEXT STEPS:");
  console.log("1. Open frontend: http://localhost:3000");
  console.log("2. Click 'Start Tracing Now'");
  console.log("3. Enter product code: PIZZA-MARG-001");
  console.log("4. See complete farm-to-table journey!");
  console.log("5. Test blockchain verification system");
  console.log("\n💡 FOR REMIX IDE:");
  console.log("- Contract is loaded and ready");
  console.log("- All addresses have appropriate roles assigned");
  console.log("- Use different addresses to simulate different entities");
  console.log(
    "- Check the README.md for complete documentation and Remix IDE instructions"
  );

  // Save test data for easy reference
  const testData = {
    timestamp: new Date().toISOString(),
    contractAddress: deployment.contractAddress,
    addresses: {
      admin: admin.address,
      farmer: farmer.address,
      processor: processor.address,
      distributor: distributor.address,
      retailer: retailer.address,
    },
    testProducts: {
      pizza: "PIZZA-MARG-001",
      shipment: "SHIP-MARG-001",
    },
    ingredients: ["ORG-TOM-001", "MOZ-CHZ-001", "DOH-WHT-001"],
    temperatureReadings: tempReadings.length,
  };

  fs.writeFileSync(
    path.join(__dirname, "../test-environment-data.json"),
    JSON.stringify(testData, null, 2)
  );

  console.log("\n💾 Test environment data saved to test-environment-data.json");
  console.log(
    "🚀 Your Rich's Pizza Traceability platform is ready for demonstration! 🍕✨"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
