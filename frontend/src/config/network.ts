import { CONTRACT_CONFIG } from "@/config/contracts";

const resolvedNetworkName =
  process.env.NEXT_PUBLIC_NETWORK_NAME?.trim() || CONTRACT_CONFIG.networkName;
const resolvedCurrencySymbol =
  process.env.NEXT_PUBLIC_NATIVE_CURRENCY_SYMBOL?.trim() || "MINT";

export const NETWORK_SETUP = {
  networkName: resolvedNetworkName,
  chainId: CONTRACT_CONFIG.requiredChainId,
  rpcUrl: CONTRACT_CONFIG.readOnlyRpcUrl,
  nativeCurrencySymbol: resolvedCurrencySymbol,
  explorerUrl:
    process.env.NEXT_PUBLIC_EXPLORER_URL?.trim() || "https://explorer.mintaray.xyz",
};
