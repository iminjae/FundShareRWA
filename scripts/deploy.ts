import { ethers } from "hardhat";

// 테스트 지갑 주소 넣기
const sampleInvestors: string[] = [
  "",
  ""
]; 

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("\n=== Deployer ===");
  console.log(`Address: ${deployer.address}`);

  console.log("\n=== Deploy Contracts ===");

  const FundShareToken = await ethers.getContractFactory("FundShareToken");
  const fundShareToken = await FundShareToken.deploy(deployer.address);
  await fundShareToken.waitForDeployment();
  const fundShareTokenAddress = await fundShareToken.getAddress();

  const RedemptionManager = await ethers.getContractFactory("RedemptionManager");
  const redemptionManager = await RedemptionManager.deploy(
    deployer.address,
    fundShareTokenAddress
  );
  await redemptionManager.waitForDeployment();
  const redemptionManagerAddress = await redemptionManager.getAddress();

  console.log("\n=== Deployed Addresses ===");
  console.log(`FundShareToken:   ${fundShareTokenAddress}`);
  console.log(`RedemptionManager:${redemptionManagerAddress}`);

  console.log("\n=== Setup Actions ===");

  const whitelistTx = await fundShareToken.setSystemWhitelist(
    redemptionManagerAddress,
    true
  );
  await whitelistTx.wait();
  console.log("- RedemptionManager added to system whitelist");

  const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
  const grantBurnerTx = await fundShareToken.grantRole(
    BURNER_ROLE,
    redemptionManagerAddress
  );
  await grantBurnerTx.wait();
  console.log("- BURNER_ROLE granted to RedemptionManager");

  for (const investor of sampleInvestors) {
    const account = investor.trim();
    if (account.length === 0) continue;

    const tx = await fundShareToken.setInvestorWhitelist(account, true);
    await tx.wait();
    console.log(`- Investor whitelisted: ${account}`);
  }

  console.log("\n=== Validation Results ===");

  const isManagerSystemWhitelisted = await fundShareToken.isSystemWhitelisted(
    redemptionManagerAddress
  );
  const hasBurnerRole = await fundShareToken.hasRole(
    BURNER_ROLE,
    redemptionManagerAddress
  );

  console.log(
    `RedemptionManager system-whitelisted: ${isManagerSystemWhitelisted}`
  );
  console.log(`RedemptionManager has BURNER_ROLE: ${hasBurnerRole}`);

  if (sampleInvestors.length === 0) {
    console.log("Sample investors: none configured");
  } else {
    for (const investor of sampleInvestors) {
      const account = investor.trim();
      if (account.length === 0) continue;

      const isWhitelisted = await fundShareToken.isInvestorWhitelisted(account);
      console.log(`Investor ${account} whitelisted: ${isWhitelisted}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
