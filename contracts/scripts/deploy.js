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

  // Setup initial roles (optional - for demo purposes)
  console.log("\nSetting up demo roles...");

  // Demo addresses for different roles
  const demoAccounts = {
    farmer: "0xf17f52151EbEF6C7334FAD080c5704D77216b732",
    manufacturer: "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef",
    logistics: "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544",
    retailer: "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2",
  };

  // Grant roles
  const FARMER_ROLE = await supplyChain.FARMER_ROLE();
  const MANUFACTURER_ROLE = await supplyChain.MANUFACTURER_ROLE();
  const LOGISTICS_ROLE = await supplyChain.LOGISTICS_ROLE();
  const RETAILER_ROLE = await supplyChain.RETAILER_ROLE();

  await supplyChain.grantRole(FARMER_ROLE, demoAccounts.farmer);
  await supplyChain.grantRole(MANUFACTURER_ROLE, demoAccounts.manufacturer);
  await supplyChain.grantRole(LOGISTICS_ROLE, demoAccounts.logistics);
  await supplyChain.grantRole(RETAILER_ROLE, demoAccounts.retailer);

  console.log("Demo roles granted:");
  console.log(`- Farmer: ${demoAccounts.farmer}`);
  console.log(`- Manufacturer: ${demoAccounts.manufacturer}`);
  console.log(`- Logistics: ${demoAccounts.logistics}`);
  console.log(`- Retailer: ${demoAccounts.retailer}`);

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
