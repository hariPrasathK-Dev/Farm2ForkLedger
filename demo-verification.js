#!/usr/bin/env node

/**
 * Demo script to test the verification system
 * Run with: node demo-verification.js
 */

const axios = require("axios");

const API_BASE = "http://localhost:3001";

async function testVerificationSystem() {
  console.log("🛡️  Testing Rich's Pizza Verification System\n");

  try {
    // Test 1: Check if verification system is available
    console.log("📡 Testing blockchain connection...");
    const testResponse = await axios.get(`${API_BASE}/api/verification/test`);
    console.log(
      "✅ Blockchain connection:",
      testResponse.data.blockchain.connected
    );
    console.log(
      "✅ Contract connection:",
      testResponse.data.contract.connected
    );
    console.log("📋 Current block:", testResponse.data.blockchain.currentBlock);
    console.log("📋 Contract address:", testResponse.data.contract.address);
    console.log("");

    // Test 2: Get a sample lot code from database
    console.log("🔍 Finding sample lot codes...");
    const itemsResponse = await axios.get(`${API_BASE}/api/items?limit=3`);

    if (itemsResponse.data.items && itemsResponse.data.items.length > 0) {
      const sampleLotCode = itemsResponse.data.items[0].lot_code;
      console.log("📦 Found sample lot code:", sampleLotCode);
      console.log("");

      // Test 3: Get traceability data
      console.log("📊 Getting traceability data...");
      const traceResponse = await axios.get(
        `${API_BASE}/api/traceability/${sampleLotCode}`
      );
      console.log("✅ Traceability data retrieved successfully");
      console.log("📋 Product:", traceResponse.data.item.product_id);
      console.log("📋 Current owner:", traceResponse.data.item.current_owner);
      console.log("");

      // Test 4: Verify against blockchain
      console.log("🔐 Verifying against blockchain...");
      const verifyResponse = await axios.get(
        `${API_BASE}/api/verification/${sampleLotCode}`
      );

      console.log("🎯 Verification Results:");
      console.log("  ✅ Verified:", verifyResponse.data.verification.verified);
      console.log(
        "  📊 Trust Score:",
        verifyResponse.data.verification.trustScore + "/100"
      );

      if (verifyResponse.data.verification.discrepancies.length > 0) {
        console.log(
          "  ⚠️  Issues:",
          verifyResponse.data.verification.discrepancies.join(", ")
        );
      } else {
        console.log("  ✅ No discrepancies found");
      }

      console.log(
        "  🕒 Verification time:",
        verifyResponse.data.verificationTime
      );
      console.log("");

      // Test 5: Compare data
      console.log("🔍 Data Comparison:");
      console.log(
        "  Database lot code:",
        verifyResponse.data.verification.databaseData.lotCode
      );
      console.log(
        "  Blockchain lot code:",
        verifyResponse.data.verification.blockchainData.lotCode
      );
      console.log(
        "  Match:",
        verifyResponse.data.verification.databaseData.lotCode ===
          verifyResponse.data.verification.blockchainData.lotCode
          ? "✅"
          : "❌"
      );
      console.log("");
    } else {
      console.log("⚠️  No items found in database. Create some items first.");
    }

    console.log("🎉 Verification system test completed successfully!");
    console.log("");
    console.log("🌐 Frontend URLs to test:");
    console.log("  • Traceability Portal: http://localhost:3000/trace");
    console.log('  • Try scanning a lot code and clicking "Verify"');
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.log("");
    console.log("🔧 Troubleshooting:");
    console.log(
      "  1. Make sure your backend is running (npm start in services/indexer-api)"
    );
    console.log("  2. Make sure Ganache is running (docker-compose up)");
    console.log("  3. Make sure contracts are deployed");
    console.log("  4. Check your .env file has CONTRACT_ADDRESS set");
  }
}

// Run the test
testVerificationSystem();
