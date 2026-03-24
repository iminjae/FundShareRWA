"use client";

import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { JsonRpcSigner } from "ethers";
import { CONTRACT_CONFIG } from "@/config/contracts";
import {
  getBrowserProvider,
  getInjectedEthereum,
  resolveNetworkName,
} from "@/lib/web3";

type WalletContextValue = {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  chainName: string;
  hasProvider: boolean;
  signer?: JsonRpcSigner;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isWrongNetwork: boolean;
};

const WalletContext = createContext<WalletContextValue>({
  isConnected: false,
  address: undefined,
  chainId: undefined,
  chainName: "Disconnected",
  hasProvider: false,
  signer: undefined,
  connectWallet: async () => undefined,
  disconnectWallet: () => undefined,
  isWrongNetwork: false,
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string>();
  const [chainId, setChainId] = useState<number>();
  const [chainName, setChainName] = useState<string>("Disconnected");
  const [signer, setSigner] = useState<JsonRpcSigner>();
  const [ethereum, setEthereum] = useState<ReturnType<typeof getInjectedEthereum>>();

  const hasProvider = Boolean(ethereum);

  useEffect(() => {
    setEthereum(getInjectedEthereum());
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(undefined);
    setChainId(undefined);
    setChainName("Disconnected");
    setSigner(undefined);
  }, []);

  const connectWallet = useCallback(async () => {
    const injected = getInjectedEthereum();
    if (!injected) {
      throw new Error("No wallet provider found. Please install MetaMask.");
    }

    const provider = getBrowserProvider(injected);
    const accounts = (await injected.request({
      method: "eth_requestAccounts",
    })) as string[];

    const nextSigner = await provider.getSigner();
    const network = await provider.getNetwork();

    setAddress(accounts?.[0]);
    setSigner(nextSigner);
    const nextChainId = Number(network.chainId);
    setChainId(nextChainId);
    setChainName(
      resolveNetworkName({
        chainId: nextChainId,
        providerName: network.name,
      })
    );
  }, []);

  useEffect(() => {
    if (!ethereum?.on || !ethereum?.removeListener) return;

    const onAccountsChanged = (accountsLike: unknown) => {
      const accounts = (accountsLike ?? []) as string[];
      if (!accounts[0]) {
        disconnectWallet();
        return;
      }
      setAddress(accounts[0]);
    };

    const onChainChanged = async (hexIdLike: unknown) => {
      const hexId = String(hexIdLike ?? "0x0");
      const nextChainId = Number.parseInt(hexId, 16);
      setChainId(nextChainId);

      try {
        const provider = getBrowserProvider(ethereum);
        const network = await provider.getNetwork();
        setChainName(
          resolveNetworkName({
            chainId: Number(network.chainId),
            providerName: network.name,
          })
        );
      } catch {
        setChainName(resolveNetworkName({ chainId: nextChainId }));
      }
    };

    ethereum.on("accountsChanged", onAccountsChanged);
    ethereum.on("chainChanged", onChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", onAccountsChanged);
      ethereum.removeListener?.("chainChanged", onChainChanged);
    };
  }, [disconnectWallet, ethereum]);

  const value = useMemo<WalletContextValue>(
    () => ({
      isConnected: Boolean(address && signer),
      address,
      chainId,
      chainName,
      hasProvider,
      signer,
      connectWallet,
      disconnectWallet,
      isWrongNetwork: Boolean(
        address && chainId && chainId !== CONTRACT_CONFIG.requiredChainId
      ),
    }),
    [address, chainId, chainName, connectWallet, disconnectWallet, hasProvider, signer]
  );

  return createElement(WalletContext.Provider, { value }, children);
}

export function useWallet() {
  return useContext(WalletContext);
}
