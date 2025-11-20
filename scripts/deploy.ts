import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying RPS Tournament contract...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📍 Deploying with account: ${deployer.address}`);

  // USDC token address - Update this based on your network
  // For FHEVM Testnet, use the test USDC address if available
  // For local testing, we'll deploy a mock USDC
  let usdcAddress = process.env.USDC_ADDRESS;

  if (!usdcAddress) {
    console.log("⚠️  USDC_ADDRESS not set, deploying mock USDC token for testing...");
    
    // Deploy mock USDC for testing
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    
    console.log(`✅ Mock USDC deployed at: ${usdcAddress}`);
  } else {
    console.log(`📌 Using existing USDC at: ${usdcAddress}`);
  }

  // Deploy RPSTournament contract
  const RPSTournament = await ethers.getContractFactory("RPSTournament");
  const rpsTournament = await RPSTournament.deploy(usdcAddress);
  await rpsTournament.waitForDeployment();
  
  const contractAddress = await rpsTournament.getAddress();
  console.log(`✅ RPSTournament deployed at: ${contractAddress}`);

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    rpsContractAddress: contractAddress,
    usdcAddress: usdcAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Return addresses for use in other scripts
  return {
    rpsTournamentAddress: contractAddress,
    usdcAddress: usdcAddress,
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
