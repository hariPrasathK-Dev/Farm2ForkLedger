#!/usr/bin/env node

/**
 * Extract private keys for MetaMask import
 * WARNING: Only use these for testing! Never in production!
 */

const { ethers } = require("hardhat");

async function getPrivateKeys() {
  console.log("🔑 Private Keys for MetaMask Import (TESTNET ONLY!)\n");
  console.log("⚠️  WARNING: Never use these keys with real money!\n");

  const signers = await ethers.getSigners();

  const roles = [
    "Admin (Deployer)",
    "Farmer 1 (Green Valley)",
    "Farmer 2 (Organic Hills)",
    "Manufacturer (Rich's)",
    "Logistics (LogiCorp)",
    "Retailer (SuperMart)",
    "Consumer 1 (John)",
    "Consumer 2 (Jane)",
  ];

  for (let i = 0; i < Math.min(8, signers.length); i++) {
    console.log(`Account ${i} - ${roles[i]}:`);
    console.log(`  Address: ${signers[i].address}`);
    console.log(`  Private Key: ${signers[i].privateKey}`);
    console.log(
      `  Balance: ${ethers.formatEther(
        await ethers.provider.getBalance(signers[i].address)
      )} ETH`
    );
    console.log("");
  }

  console.log("📱 How to import to MetaMask:");
  console.log("  1. Open MetaMask");
  console.log("  2. Click account icon > Import Account");
  console.log("  3. Select 'Private Key' and paste one of the keys above");
  console.log("  4. Switch between accounts to test different roles");
  console.log("");

  console.log("🌐 Network Settings for MetaMask:");
  console.log("  Network Name: Ganache Local");
  console.log("  RPC URL: http://localhost:8545");
  console.log("  Chain ID: 2024");
  console.log("  Currency Symbol: ETH");
}

getPrivateKeys();
