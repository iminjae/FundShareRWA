import deployedContracts from "@/config/deployedContracts.json";

type DeployedContractsConfig = {
  chainId: number;
  networkName: string;
  deployedAt: string;
  contracts: {
    FundShareToken: string;
    RedemptionManager: string;
  };
  rpcUrl?: string;
};

const deployed = deployedContracts as DeployedContractsConfig;
const jsonRpcUrl = deployed.rpcUrl?.trim() ?? "";
const envRpcUrl = process.env.NEXT_PUBLIC_READ_RPC_URL?.trim() ?? "";
export const READ_ONLY_RPC_URL = jsonRpcUrl || envRpcUrl;

export const CONTRACT_CONFIG = {
  fundShareTokenAddress: deployed.contracts.FundShareToken,
  redemptionManagerAddress: deployed.contracts.RedemptionManager,
  requiredChainId: Number(deployed.chainId),
  networkName: deployed.networkName,
  deployedAt: deployed.deployedAt,
  readOnlyRpcUrl: READ_ONLY_RPC_URL,
};

export function isConfiguredAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function hasValidContractConfig(): boolean {
  return (
    isConfiguredAddress(CONTRACT_CONFIG.fundShareTokenAddress) &&
    isConfiguredAddress(CONTRACT_CONFIG.redemptionManagerAddress)
  );
}

export function hasReadOnlyRpcConfig(): boolean {
  return CONTRACT_CONFIG.readOnlyRpcUrl.length > 0;
}
