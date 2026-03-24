import {
  Contract,
  type ContractRunner,
  type InterfaceAbi,
  type JsonRpcSigner,
} from "ethers";
import fundShareTokenAbi from "@/abi/FundShareToken.json";
import redemptionManagerAbi from "@/abi/RedemptionManager.json";
import { CONTRACT_CONFIG, hasValidContractConfig } from "@/config/contracts";
import { getReadOnlyProvider } from "@/lib/web3";

export type FundShareTokenContract = Contract;
export type RedemptionManagerContract = Contract;

function assertConfigured() {
  if (!hasValidContractConfig()) {
    throw new Error(
      "Contract addresses are missing or invalid in src/config/deployedContracts.json"
    );
  }
}

export function getFundShareTokenReadContract(
  provider: ContractRunner = getReadOnlyProvider()
): FundShareTokenContract {
  assertConfigured();
  return new Contract(
    CONTRACT_CONFIG.fundShareTokenAddress,
    fundShareTokenAbi as InterfaceAbi,
    provider
  );
}

export function getFundShareTokenWriteContract(
  signer: JsonRpcSigner
): FundShareTokenContract {
  return getFundShareTokenReadContract(signer);
}

export function getRedemptionManagerReadContract(
  provider: ContractRunner = getReadOnlyProvider()
): RedemptionManagerContract {
  assertConfigured();
  return new Contract(
    CONTRACT_CONFIG.redemptionManagerAddress,
    redemptionManagerAbi as InterfaceAbi,
    provider
  );
}

export function getRedemptionManagerWriteContract(
  signer: JsonRpcSigner
): RedemptionManagerContract {
  return getRedemptionManagerReadContract(signer);
}

export function getReadContracts() {
  const provider = getReadOnlyProvider();
  return {
    fundShareToken: getFundShareTokenReadContract(provider),
    redemptionManager: getRedemptionManagerReadContract(provider),
  };
}

export function getWriteContracts(signer: JsonRpcSigner) {
  return {
    fundShareToken: getFundShareTokenWriteContract(signer),
    redemptionManager: getRedemptionManagerWriteContract(signer),
  };
}
