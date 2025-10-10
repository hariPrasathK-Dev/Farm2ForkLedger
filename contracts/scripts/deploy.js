const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying SupplyChain contract...");

  // Get the contract factory
  const SupplyChain = await ethers.getContractFactory("SupplyChain");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the contract with the deployer as admin
  const supplyChain = await SupplyChain.deploy(deployer.address);
  await supplyChain.waitForDeployment();

  const contractAddress = await supplyChain.getAddress();
  console.log("SupplyChain deployed to:", contractAddress);

  // Save deployment information
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    networkName: hre.network.name,
    chainId: network.chainId.toString(), // Convert BigInt to string
  };

  // Create deployment directory if it doesn't exist
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  // Save deployment info
  fs.writeFileSync(
    path.join(deploymentDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Save ABI for the frontend
  const artifact = await hre.artifacts.readArtifact("SupplyChain");
  fs.writeFileSync(
    path.join(deploymentDir, "SupplyChain.json"),
    JSON.stringify(
      {
        contractName: "SupplyChain",
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        deployedBytecode: artifact.deployedBytecode,
        address: contractAddress,
      },
      null,
      2
    )
  );

  console.log("Deployment information saved to deployments directory");

  // Contract is now deployed with only the deployer as admin
  console.log("\n✅ Contract deployed successfully!");
  console.log(`📋 Admin (you): ${deployer.address}`);
  console.log("🎯 You now have full control to assign roles to any addresses");
  console.log("\n📖 Next Steps:");
  console.log("1. Open Remix IDE and connect to your local blockchain");
  console.log("2. Load your contract and assign roles to addresses as needed");
  console.log("3. Use different addresses to create supply chain transactions");
  console.log("4. Your indexer will automatically capture all transactions");

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
