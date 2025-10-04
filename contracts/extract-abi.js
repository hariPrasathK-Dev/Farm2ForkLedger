const fs = require("fs");
const path = require("path");

// Read the compiled contract artifact
const artifactPath = path.join(
  __dirname,
  "artifacts/contracts/SupplyChain.sol/SupplyChain.json"
);
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

// Create deployment info for frontend
const deploymentInfo = {
  contractName: "SupplyChain",
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  deployedBytecode: artifact.deployedBytecode,
  address: "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab",
  network: "local",
  chainId: "2024",
};

// Save ABI file for frontend
fs.writeFileSync(
  path.join(__dirname, "deployments/SupplyChain.json"),
  JSON.stringify(deploymentInfo, null, 2)
);

console.log("✅ ABI and deployment info saved to deployments/SupplyChain.json");
