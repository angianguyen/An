const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying StreamCredit with MockVerifier...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy MockUSDC (reuse if exists)
  console.log("1️⃣ Deploying MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ MockUSDC deployed to:", usdcAddress);

  // Deploy MockVerifier (for testing - always returns true)
  console.log("\n2️⃣ Deploying MockVerifier (Testing Only)...");
  const MockVerifier = await hre.ethers.getContractFactory("MockVerifier");
  const verifier = await MockVerifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("✅ MockVerifier deployed to:", verifierAddress);
  console.log("⚠️  WARNING: MockVerifier always returns TRUE - FOR TESTING ONLY!");

  // Deploy StreamCredit
  console.log("\n3️⃣ Deploying StreamCredit...");
  const StreamCredit = await hre.ethers.getContractFactory("StreamCredit");
  const streamCredit = await StreamCredit.deploy(verifierAddress, usdcAddress);
  await streamCredit.waitForDeployment();
  const streamCreditAddress = await streamCredit.getAddress();
  console.log("✅ StreamCredit deployed to:", streamCreditAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY (MOCK VERIFIER)");
  console.log("=".repeat(60));
  console.log("MockUSDC:        ", usdcAddress);
  console.log("MockVerifier:    ", verifierAddress, "(⚠️  TESTING ONLY)");
  console.log("StreamCredit:    ", streamCreditAddress);
  console.log("=".repeat(60));

  console.log("\n💡 Update frontend constants.js with these addresses");

  // Save addresses
  const fs = require('fs');
  const addresses = {
    network: "sepolia",
    mockUSDC: usdcAddress,
    mockVerifier: verifierAddress,
    streamCredit: streamCreditAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    note: "MockVerifier - FOR TESTING ONLY"
  };
  
  fs.writeFileSync(
    'deployed-addresses-mock.json',
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n✅ Addresses saved to deployed-addresses-mock.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
