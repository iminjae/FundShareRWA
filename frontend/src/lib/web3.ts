import { BrowserProvider, JsonRpcProvider } from "ethers";
import {
  CONTRACT_CONFIG,
  hasReadOnlyRpcConfig,
} from "@/config/contracts";

export type EthereumLike = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumLike;
  }
}

export function getInjectedEthereum(): EthereumLike | undefined {
  if (typeof window === "undefined") return undefined;
  return window.ethereum;
}

export function getBrowserProvider(ethereum: EthereumLike): BrowserProvider {
  return new BrowserProvider(ethereum);
}

let readOnlyProvider: JsonRpcProvider | undefined;
let hasLoggedReadConfig = false;

export function getReadOnlyProvider(): JsonRpcProvider {
  if (!hasReadOnlyRpcConfig()) {
    throw new Error(
      "Read-only RPC URL is not configured. Add rpcUrl to src/config/deployedContracts.json or set NEXT_PUBLIC_READ_RPC_URL."
    );
  }

  if (!readOnlyProvider) {
    readOnlyProvider = new JsonRpcProvider(CONTRACT_CONFIG.readOnlyRpcUrl);
  }

  if (process.env.NODE_ENV !== "production" && !hasLoggedReadConfig) {
    hasLoggedReadConfig = true;
    console.debug("[read-provider]", {
      networkName: CONTRACT_CONFIG.networkName,
      chainId: CONTRACT_CONFIG.requiredChainId,
      rpcUrl: CONTRACT_CONFIG.readOnlyRpcUrl,
    });
  }

  return readOnlyProvider;
}

export function resolveNetworkName(params: {
  chainId?: number;
  providerName?: string;
}): string {
  const { chainId, providerName } = params;

  if (providerName && providerName !== "unknown") {
    return providerName;
  }

  if (!chainId) return "Unknown Network";
  return `chain-${chainId}`;
}
