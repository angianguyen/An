const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying StreamCredit Protocol to Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy MockUSDC
  console.log("1️⃣ Deploying MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ MockUSDC deployed to:", usdcAddress);

  // Deploy REAL Groth16 Verifier (generated from Circom)
  console.log("\n2️⃣ Deploying Groth16Verifier (REAL ZK Verifier)...");
  const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ Groth16Verifier deployed to:", verifierAddress);

  // Deploy StreamCredit
  console.log("\n3️⃣ Deploying StreamCredit...");
  const StreamCredit = await hre.ethers.getContractFactory("StreamCredit");
  const streamCredit = await StreamCredit.deploy(verifierAddress, usdcAddress);
  await streamCredit.waitForDeployment();
  const streamCreditAddress = await streamCredit.getAddress();
  console.log("✅ StreamCredit deployed to:", streamCreditAddress);

  // Deployment completed
  console.log("\n✅ Deployment completed!");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("MockUSDC:        ", usdcAddress);
  console.log("Groth16Verifier: ", verifierAddress);
  console.log("StreamCredit:    ", streamCreditAddress);
  console.log("=".repeat(60));

  console.log("\n💡 Next steps:");
  console.log("1. Verify contracts on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${usdcAddress}`);
  console.log(`   npx hardhat verify --network sepolia ${verifierAddress}`);
  console.log(`   npx hardhat verify --network sepolia ${streamCreditAddress} ${verifierAddress} ${usdcAddress}`);
  console.log("\n2. Update frontend with contract addresses");
  console.log("\n3. Test the demo scenarios!");

  // Save addresses to file
  const fs = require('fs');
  const addresses = {
    network: "sepolia",
    mockUSDC: usdcAddress,
    groth16Verifier: verifierAddress,
    streamCredit: streamCreditAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    'deployed-addresses.json',
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n✅ Addresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
