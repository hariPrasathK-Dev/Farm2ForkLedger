#!/usr/bin/env node

/**
 * Demo script showing how to interact with different addresses
 * This simulates what happens in Remix, but programmatically
 */

const { ethers } = require("hardhat");

async function demonstrateAddressSwitching() {
  console.log("🎭 Address Switching Demo for Rich's Pizza\n");

  // Get all available signers (like Remix address dropdown)
  const signers = await ethers.getSigners();

  console.log("📋 Available Addresses (like Remix dropdown):");
  for (let i = 0; i < Math.min(5, signers.length); i++) {
    console.log(
      `  Account ${i}: ${signers[i].address} (Balance: ${ethers.formatEther(
        await ethers.provider.getBalance(signers[i].address)
      )} ETH)`
    );
  }
  console.log("");

  // Connect to deployed contract
  const contractAddress =
    process.env.CONTRACT_ADDRESS ||
    "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab";
  const SupplyChain = await ethers.getContractFactory("SupplyChain");

  // ========================================
  // ADMIN OPERATIONS (Account 0)
  // ========================================
  console.log("👑 ADMIN OPERATIONS (Account 0)");
  const adminContract = SupplyChain.attach(contractAddress).connect(signers[0]);
  console.log(`  Using address: ${signers[0].address}`);

  // Grant farmer role to Account 1
  const FARMER_ROLE = await adminContract.FARMER_ROLE();
  console.log(`  Granting FARMER_ROLE to ${signers[1].address}...`);

  try {
    const tx1 = await adminContract.grantRole(FARMER_ROLE, signers[1].address);
    await tx1.wait();
    console.log("  ✅ Farmer role granted");
  } catch (error) {
    console.log("  ✅ Role already granted or operation failed");
  }
  console.log("");

  // ========================================
  // FARMER OPERATIONS (Account 1)
  // ========================================
  console.log("🌱 FARMER OPERATIONS (Account 1)");
  const farmerContract = SupplyChain.attach(contractAddress).connect(
    signers[1]
  );
  console.log(`  Using address: ${signers[1].address}`);

  // Create ingredient
  console.log("  Creating organic tomatoes...");
  try {
    const tx2 = await farmerContract.createIngredient(
      "ORGANIC_TOMATOES",
      `TOM_BATCH_${Date.now()}`,
      "Green Valley Farm, GPS: 40.7128,-74.0060"
    );
    const receipt = await tx2.wait();
    console.log(`  ✅ Tomatoes created! Tx: ${receipt.hash}`);

    // Find the ItemCreated event
    const event = receipt.logs.find((log) => {
      try {
        return farmerContract.interface.parseLog(log).name === "ItemCreated";
      } catch (e) {
        return false;
      }
    });

    if (event) {
      const parsedEvent = farmerContract.interface.parseLog(event);
      console.log(`  📦 Item ID: ${parsedEvent.args.itemId}`);
      console.log(`  📋 Lot Code: ${parsedEvent.args.lotCode}`);
    }
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}`);
  }
  console.log("");

  // ========================================
  // MANUFACTURER OPERATIONS (Account 2)
  // ========================================
  console.log("🏭 MANUFACTURER OPERATIONS (Account 2)");
  const manufacturerContract = SupplyChain.attach(contractAddress).connect(
    signers[2]
  );
  console.log(`  Using address: ${signers[2].address}`);

  // First grant manufacturer role
  console.log("  Granting MANUFACTURER_ROLE...");
  const MANUFACTURER_ROLE = await adminContract.MANUFACTURER_ROLE();
  try {
    const tx3 = await adminContract.grantRole(
      MANUFACTURER_ROLE,
      signers[2].address
    );
    await tx3.wait();
    console.log("  ✅ Manufacturer role granted");
  } catch (error) {
    console.log("  ✅ Role already granted");
  }

  // Manufacturer can combine ingredients (if they exist)
  console.log("  Manufacturer functions now available to this address");
  console.log("");

  // ========================================
  // DEMONSTRATE ROLE CHECKING
  // ========================================
  console.log("🔐 ROLE VERIFICATION");

  const roles = [
    { name: "ADMIN", role: await adminContract.ADMIN_ROLE() },
    { name: "FARMER", role: await adminContract.FARMER_ROLE() },
    { name: "MANUFACTURER", role: await adminContract.MANUFACTURER_ROLE() },
    { name: "LOGISTICS", role: await adminContract.LOGISTICS_ROLE() },
    { name: "RETAILER", role: await adminContract.RETAILER_ROLE() },
  ];

  for (let i = 0; i < 3; i++) {
    console.log(`  Account ${i} (${signers[i].address}):`);
    for (const roleInfo of roles) {
      const hasRole = await adminContract.hasRole(
        roleInfo.role,
        signers[i].address
      );
      console.log(`    ${roleInfo.name}: ${hasRole ? "✅" : "❌"}`);
    }
    console.log("");
  }

  console.log("🎯 Key Points:");
  console.log(
    "  • Each address can only call functions for their assigned role"
  );
  console.log("  • This is enforced by the smart contract automatically");
  console.log("  • In your frontend, MetaMask provides the address");
  console.log("  • The UI shows different options based on user's role");
  console.log("");

  console.log("🌐 In your web app:");
  console.log("  1. User connects MetaMask");
  console.log("  2. App detects their address");
  console.log("  3. App checks their role on smart contract");
  console.log("  4. App shows only functions they can access");
  console.log(
    "  5. When they click a button, app calls contract with their address"
  );
}

// Run the demo
demonstrateAddressSwitching()
  .then(() => {
    console.log("✅ Demo completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  });
