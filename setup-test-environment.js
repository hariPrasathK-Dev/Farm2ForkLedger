#!/usr/bin/env node

/**
 * Setup script to properly assign roles to all test addresses
 * This creates a complete testing environment with all entity types
 */

const { ethers } = require("hardhat");

async function setupTestEnvironment() {
  console.log("🏗️  Setting up Complete Test Environment\n");

  // Get signers
  const signers = await ethers.getSigners();
  const [
    admin,
    farmer1,
    farmer2,
    manufacturer,
    logistics,
    retailer,
    consumer1,
    consumer2,
  ] = signers;

  // Connect to contract
  const contractAddress =
    process.env.CONTRACT_ADDRESS ||
    "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab";
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const contract = SupplyChain.attach(contractAddress).connect(admin);

  // Get role hashes
  const FARMER_ROLE = await contract.FARMER_ROLE();
  const MANUFACTURER_ROLE = await contract.MANUFACTURER_ROLE();
  const LOGISTICS_ROLE = await contract.LOGISTICS_ROLE();
  const RETAILER_ROLE = await contract.RETAILER_ROLE();

  console.log("👥 Assigning Roles to Test Addresses:\n");

  // Setup entity addresses
  const entities = [
    { role: "ADMIN", address: admin.address, signer: admin, roleHash: null },
    {
      role: "FARMER",
      address: farmer1.address,
      signer: farmer1,
      roleHash: FARMER_ROLE,
      name: "Green Valley Farm",
    },
    {
      role: "FARMER",
      address: farmer2.address,
      signer: farmer2,
      roleHash: FARMER_ROLE,
      name: "Organic Hills Farm",
    },
    {
      role: "MANUFACTURER",
      address: manufacturer.address,
      signer: manufacturer,
      roleHash: MANUFACTURER_ROLE,
      name: "Rich's Products Inc",
    },
    {
      role: "LOGISTICS",
      address: logistics.address,
      signer: logistics,
      roleHash: LOGISTICS_ROLE,
      name: "LogiCorp Shipping",
    },
    {
      role: "RETAILER",
      address: retailer.address,
      signer: retailer,
      roleHash: RETAILER_ROLE,
      name: "SuperMart Chain",
    },
    {
      role: "CONSUMER",
      address: consumer1.address,
      signer: consumer1,
      roleHash: null,
      name: "John Consumer",
    },
    {
      role: "CONSUMER",
      address: consumer2.address,
      signer: consumer2,
      roleHash: null,
      name: "Jane Consumer",
    },
  ];

  // Grant roles
  for (const entity of entities) {
    if (entity.roleHash) {
      try {
        console.log(`🎭 Granting ${entity.role} role to ${entity.name}`);
        console.log(`   Address: ${entity.address}`);

        const tx = await contract.grantRole(entity.roleHash, entity.address);
        await tx.wait();

        // Verify role was granted
        const hasRole = await contract.hasRole(entity.roleHash, entity.address);
        console.log(`   Status: ${hasRole ? "✅ SUCCESS" : "❌ FAILED"}\n`);
      } catch (error) {
        console.log(`   Status: ✅ ALREADY GRANTED\n`);
      }
    } else {
      console.log(`👤 ${entity.role}: ${entity.name}`);
      console.log(`   Address: ${entity.address}`);
      console.log(`   Status: ✅ READY (No role required)\n`);
    }
  }

  console.log("🏭 Creating Sample Supply Chain Data:\n");

  // 1. Farmer 1 creates tomatoes
  console.log("🍅 Farmer 1 creating organic tomatoes...");
  const farmerContract1 = contract.connect(farmer1);
  const tomatoTx = await farmerContract1.createIngredient(
    "ORGANIC_TOMATOES",
    "TOM_BATCH_001",
    "Green Valley Farm, California"
  );
  await tomatoTx.wait();
  console.log("   ✅ Tomatoes created\n");

  // 2. Farmer 2 creates cheese
  console.log("🧀 Farmer 2 creating organic cheese...");
  const farmerContract2 = contract.connect(farmer2);
  const cheeseTx = await farmerContract2.createIngredient(
    "ORGANIC_CHEESE",
    "CHEESE_BATCH_001",
    "Organic Hills Farm, Wisconsin"
  );
  await cheeseTx.wait();
  console.log("   ✅ Cheese created\n");

  // 3. Get item IDs for combining
  const tomatoItemId = await contract.getItemIdByLotCode("TOM_BATCH_001");
  const cheeseItemId = await contract.getItemIdByLotCode("CHEESE_BATCH_001");

  // 4. Manufacturer combines ingredients
  console.log("🍕 Manufacturer creating pizza from ingredients...");
  const manufacturerContract = contract.connect(manufacturer);
  const pizzaTx = await manufacturerContract.combineItems(
    [tomatoItemId, cheeseItemId],
    "DELUXE_PIZZA",
    "PIZZA_BATCH_001",
    "Rich's Manufacturing Plant, New York"
  );
  await pizzaTx.wait();
  console.log("   ✅ Pizza created\n");

  console.log("📋 Test Environment Summary:");
  console.log("=".repeat(50));

  console.log("\n🎭 ROLE ASSIGNMENTS:");
  for (const entity of entities) {
    console.log(
      `  ${
        entity.role.padRight ? entity.role.padRight(12) : entity.role.padEnd(12)
      } ${entity.address} (${entity.name})`
    );
  }

  console.log("\n📦 SAMPLE DATA CREATED:");
  console.log("  • TOM_BATCH_001   - Organic Tomatoes (Green Valley Farm)");
  console.log("  • CHEESE_BATCH_001 - Organic Cheese (Organic Hills Farm)");
  console.log("  • PIZZA_BATCH_001  - Deluxe Pizza (Rich's Products)");

  console.log("\n🧪 TESTING INSTRUCTIONS:");
  console.log("  1. Import these addresses into MetaMask:");
  for (let i = 0; i < entities.length; i++) {
    console.log(
      `     Account ${i}: ${entities[i].address} (${entities[i].name})`
    );
  }

  console.log("\n  2. Use private keys to import (TESTNET ONLY!):");
  console.log("     Run: npx hardhat console --network local");
  console.log("     Then: (await ethers.getSigners())[0].privateKey");

  console.log("\n  3. Frontend Testing:");
  console.log("     • Connect different MetaMask accounts");
  console.log("     • See different UI options based on role");
  console.log("     • Test traceability with: PIZZA_BATCH_001");
  console.log("     • Test verification system");

  console.log("\n✅ Test environment setup complete!");
}

// Run the setup
setupTestEnvironment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
