import hre, { ethers } from "hardhat";
import path from "path";
import { promises as fs } from "fs";

// 테스트 지갑 주소 넣기
const sampleInvestors: string[] = [
  "",
  ""
];

type ArtifactJson = {
  abi: unknown;
};

type DeployedContractsPayload = {
  chainId: number;
  networkName: string;
  deployer: string;
  deployedAt: string;
  rpcUrl?: string;
  contracts: {
    FundShareToken: string;
    RedemptionManager: string;
  };
};

async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function exportAbi({
  artifactPath,
  outputPath,
}: {
  artifactPath: string;
  outputPath: string;
}) {
  const artifactRaw = await fs.readFile(artifactPath, "utf8");
  const artifact = JSON.parse(artifactRaw) as ArtifactJson;

  if (!artifact.abi) {
    throw new Error(`ABI not found in artifact: ${artifactPath}`);
  }

  await fs.writeFile(outputPath, `${JSON.stringify(artifact.abi, null, 2)}\n`, "utf8");
}

async function upsertEnvFile(
  envFilePath: string,
  entries: Record<string, string>
) {
  let existing = "";
  try {
    existing = await fs.readFile(envFilePath, "utf8");
  } catch {
    existing = "";
  }

  const lines = existing.length > 0 ? existing.split(/\r?\n/) : [];
  const keys = Object.keys(entries);
  const seen = new Set<string>();

  const nextLines = lines.map((line) => {
    const match = line.match(/^([A-Z0-9_]+)=/);
    if (!match) return line;

    const key = match[1];
    if (!(key in entries)) return line;

    seen.add(key);
    return `${key}=${entries[key]}`;
  });

  for (const key of keys) {
    if (!seen.has(key)) {
      nextLines.push(`${key}=${entries[key]}`);
    }
  }

  const content = `${nextLines.filter((line) => line !== "").join("\n")}\n`;
  await fs.writeFile(envFilePath, content, "utf8");
}

async function exportFrontendArtifacts(params: {
  chainId: number;
  networkName: string;
  deployer: string;
  fundShareTokenAddress: string;
  redemptionManagerAddress: string;
  readOnlyRpcUrl?: string;
}) {
  const {
    chainId,
    networkName,
    deployer,
    fundShareTokenAddress,
    redemptionManagerAddress,
    readOnlyRpcUrl,
  } = params;

  const rootDir = process.cwd();
  const frontendConfigDir = path.join(rootDir, "frontend", "src", "config");
  const frontendAbiDir = path.join(rootDir, "frontend", "src", "abi");
  const frontendDir = path.join(rootDir, "frontend");

  const fundShareTokenArtifactPath = path.join(
    rootDir,
    "artifacts",
    "contracts",
    "FundShareToken.sol",
    "FundShareToken.json"
  );
  const redemptionManagerArtifactPath = path.join(
    rootDir,
    "artifacts",
    "contracts",
    "RedemptionManager.sol",
    "RedemptionManager.json"
  );

  const deployedContractsPath = path.join(
    frontendConfigDir,
    "deployedContracts.json"
  );
  const fundShareTokenAbiOutputPath = path.join(
    frontendAbiDir,
    "FundShareToken.json"
  );
  const redemptionManagerAbiOutputPath = path.join(
    frontendAbiDir,
    "RedemptionManager.json"
  );
  const frontendEnvLocalPath = path.join(frontendDir, ".env.local");

  console.log("\n=== Frontend Export Started ===");

  await ensureDir(frontendConfigDir);
  await ensureDir(frontendAbiDir);

  const deployedPayload: DeployedContractsPayload = {
    chainId,
    networkName,
    deployer,
    deployedAt: new Date().toISOString(),
    contracts: {
      FundShareToken: fundShareTokenAddress,
      RedemptionManager: redemptionManagerAddress,
    },
  };
  if (readOnlyRpcUrl && readOnlyRpcUrl.length > 0) {
    deployedPayload.rpcUrl = readOnlyRpcUrl;
  }

  await fs.writeFile(
    deployedContractsPath,
    `${JSON.stringify(deployedPayload, null, 2)}\n`,
    "utf8"
  );
  console.log(`- deployedContracts.json written: ${deployedContractsPath}`);

  await exportAbi({
    artifactPath: fundShareTokenArtifactPath,
    outputPath: fundShareTokenAbiOutputPath,
  });
  console.log(`- FundShareToken ABI exported: ${fundShareTokenAbiOutputPath}`);

  await exportAbi({
    artifactPath: redemptionManagerArtifactPath,
    outputPath: redemptionManagerAbiOutputPath,
  });
  console.log(`- RedemptionManager ABI exported: ${redemptionManagerAbiOutputPath}`);

  const frontendEnvEntries: Record<string, string> = {
    NEXT_PUBLIC_FUND_SHARE_TOKEN_ADDRESS: fundShareTokenAddress,
    NEXT_PUBLIC_REDEMPTION_MANAGER_ADDRESS: redemptionManagerAddress,
    NEXT_PUBLIC_CHAIN_ID: String(chainId),
  };
  if (readOnlyRpcUrl && readOnlyRpcUrl.length > 0) {
    frontendEnvEntries.NEXT_PUBLIC_READ_RPC_URL = readOnlyRpcUrl;
  }

  await upsertEnvFile(frontendEnvLocalPath, frontendEnvEntries);
  console.log(`- frontend .env.local updated: ${frontendEnvLocalPath}`);

  console.log("=== Frontend Export Completed ===");
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const networkName =
    network.name && network.name !== "unknown"
      ? network.name
      : `chain-${chainId}`;
  const configuredNetworkUrl =
    "url" in hre.network.config && typeof hre.network.config.url === "string"
      ? hre.network.config.url.trim()
      : "";
  const networkRpcEnvKey = `${networkName.toUpperCase()}_RPC_URL`.replace(
    /[^A-Z0-9_]/g,
    "_"
  );
  const readOnlyRpcUrl =
    configuredNetworkUrl
    || process.env[networkRpcEnvKey]?.trim()
    || "";

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

  await exportFrontendArtifacts({
    chainId,
    networkName,
    deployer: deployer.address,
    fundShareTokenAddress,
    redemptionManagerAddress,
    readOnlyRpcUrl,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
