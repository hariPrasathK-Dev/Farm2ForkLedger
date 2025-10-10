#!/usr/bin/env node

/**
 * Diagnostic script to check blockchain connection and setup
 * Run this before setup:complete to verify everything is working
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function diagnose() {
  console.log("🔍 Rich's Pizza Platform - Connection Diagnostics\n");

  try {
    // Test 1: Check if we can connect to the blockchain
    console.log("1️⃣ Testing blockchain connection...");
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log(
      `   ✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`
    );

    const blockNumber = await provider.getBlockNumber();
    console.log(`   ✅ Current block number: ${blockNumber}`);

    // Test 2: Check if we have signers
    console.log("\n2️⃣ Testing signer accounts...");
    const signers = await ethers.getSigners();
    console.log(`   ✅ Found ${signers.length} accounts`);

    if (signers.length < 5) {
      console.log("   ⚠️  WARNING: Need at least 5 accounts for setup script");
      console.log("   💡 Make sure Ganache is running with --accounts 10");
    }

    // List first 5 accounts
    for (let i = 0; i < Math.min(5, signers.length); i++) {
      const balance = await provider.getBalance(signers[i].address);
      console.log(
        `   Account ${i}: ${signers[i].address} (${ethers.formatEther(
          balance
        )} ETH)`
      );
    }

    // Test 3: Check deployment file
    console.log("\n3️⃣ Checking deployment file...");
    const deploymentPath = path.join(__dirname, "../deployments/local.json");

    if (!fs.existsSync(deploymentPath)) {
      console.log("   ❌ Deployment file not found!");
      console.log("   💡 Run 'npm run deploy:local' first");
      return;
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    console.log(`   ✅ Contract deployed at: ${deployment.contractAddress}`);
    console.log(`   ✅ Deployed by: ${deployment.deployer}`);

    // Test 4: Try to connect to the contract
    console.log("\n4️⃣ Testing contract connection...");
    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const contract = SupplyChain.attach(deployment.contractAddress);

    // Try a simple read operation
    const admin = signers[0];
    const ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, admin.address);
    console.log(
      `   ✅ Contract accessible: Admin role check = ${hasAdminRole}`
    );

    console.log("\n🎉 All diagnostics passed! Ready to run setup:complete");
  } catch (error) {
    console.log("\n❌ Diagnostic failed:");
    console.log(`   Error: ${error.message}`);

    console.log("\n🛠️  Troubleshooting steps:");
    console.log("1. Make sure Docker is running");
    console.log(
      "2. Start blockchain: docker-compose up -d (from project root)"
    );
    console.log(
      "3. Check if Ganache is accessible: curl http://localhost:8545"
    );
    console.log("4. Deploy contract: npm run deploy:local");
    console.log("5. Run this diagnostic again");
  }
}

diagnose()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Diagnostic script failed:", error);
    process.exit(1);
  });
