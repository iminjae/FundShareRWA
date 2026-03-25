"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isAddress, type ContractTransactionResponse, type JsonRpcSigner } from "ethers";
import {
  COMPLIANCE_ROLE,
  DEFAULT_ADMIN_ROLE,
  MINTER_ROLE,
  PAUSER_ROLE,
  REDEMPTION_OPERATOR_ROLE,
} from "@/lib/constants";
import { getReadContracts, getWriteContracts } from "@/lib/contracts";

export type AdminCapabilities = {
  fstDefaultAdmin: boolean;
  fstCompliance: boolean;
  fstMinter: boolean;
  fstPauser: boolean;
  rmDefaultAdmin: boolean;
  canAccessAdmin: boolean;
};

export type TargetStatus = {
  investorWhitelisted: boolean;
  systemWhitelisted: boolean;
  operatorRole: boolean;
  balance: bigint;
  tokenPaused: boolean;
};

type AdminHookResult = {
  capabilities: AdminCapabilities;
  targetStatus: TargetStatus;
  loading: boolean;
  error?: string;
  isValidTarget: boolean;
  refresh: () => Promise<void>;
  addInvestorWhitelist: (target: string) => Promise<ContractTransactionResponse>;
  removeInvestorWhitelist: (target: string) => Promise<ContractTransactionResponse>;
  addSystemWhitelist: (target: string) => Promise<ContractTransactionResponse>;
  removeSystemWhitelist: (target: string) => Promise<ContractTransactionResponse>;
  grantOperatorRole: (target: string) => Promise<ContractTransactionResponse>;
  revokeOperatorRole: (target: string) => Promise<ContractTransactionResponse>;
  mintDemoFst: (target: string, amountWei: bigint) => Promise<ContractTransactionResponse>;
  pauseToken: () => Promise<ContractTransactionResponse>;
  unpauseToken: () => Promise<ContractTransactionResponse>;
};

const initialCapabilities: AdminCapabilities = {
  fstDefaultAdmin: false,
  fstCompliance: false,
  fstMinter: false,
  fstPauser: false,
  rmDefaultAdmin: false,
  canAccessAdmin: false,
};

const initialTargetStatus: TargetStatus = {
  investorWhitelisted: false,
  systemWhitelisted: false,
  operatorRole: false,
  balance: 0n,
  tokenPaused: false,
};

type UseAdminDataParams = {
  walletAddress?: string;
  targetAddress?: string;
  signer?: JsonRpcSigner;
  enabled: boolean;
};

function assertValidTarget(address: string) {
  if (!isAddress(address)) {
    throw new Error("Invalid target address.");
  }
}

export function useAdminData(params: UseAdminDataParams): AdminHookResult {
  const { walletAddress, targetAddress, signer, enabled } = params;
  const [capabilities, setCapabilities] = useState<AdminCapabilities>(initialCapabilities);
  const [targetStatus, setTargetStatus] = useState<TargetStatus>(initialTargetStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const isValidTarget = useMemo(
    () => Boolean(targetAddress && isAddress(targetAddress)),
    [targetAddress]
  );

  const refresh = useCallback(async () => {
    if (!enabled || !walletAddress) {
      setCapabilities(initialCapabilities);
      setTargetStatus(initialTargetStatus);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const { fundShareToken, redemptionManager } = getReadContracts();

      const [
        fstDefaultAdmin,
        fstCompliance,
        fstMinter,
        fstPauser,
        rmDefaultAdmin,
      ] = await Promise.all([
        fundShareToken.hasRole(DEFAULT_ADMIN_ROLE, walletAddress) as Promise<boolean>,
        fundShareToken.hasRole(COMPLIANCE_ROLE, walletAddress) as Promise<boolean>,
        fundShareToken.hasRole(MINTER_ROLE, walletAddress) as Promise<boolean>,
        fundShareToken.hasRole(PAUSER_ROLE, walletAddress) as Promise<boolean>,
        redemptionManager.hasRole(DEFAULT_ADMIN_ROLE, walletAddress) as Promise<boolean>,
      ]);

      const nextCapabilities: AdminCapabilities = {
        fstDefaultAdmin,
        fstCompliance,
        fstMinter,
        fstPauser,
        rmDefaultAdmin,
        canAccessAdmin:
          fstDefaultAdmin ||
          fstCompliance ||
          fstMinter ||
          fstPauser ||
          rmDefaultAdmin,
      };

      setCapabilities(nextCapabilities);

      if (targetAddress && isAddress(targetAddress)) {
        const [investorWhitelisted, systemWhitelisted, operatorRole, balance, tokenPaused] =
          await Promise.all([
            fundShareToken.isInvestorWhitelisted(targetAddress) as Promise<boolean>,
            fundShareToken.isSystemWhitelisted(targetAddress) as Promise<boolean>,
            redemptionManager.hasRole(REDEMPTION_OPERATOR_ROLE, targetAddress) as Promise<boolean>,
            fundShareToken.balanceOf(targetAddress) as Promise<bigint>,
            fundShareToken.paused() as Promise<boolean>,
          ]);

        setTargetStatus({
          investorWhitelisted,
          systemWhitelisted,
          operatorRole,
          balance,
          tokenPaused,
        });
      } else {
        const tokenPaused = (await fundShareToken.paused()) as boolean;
        setTargetStatus({
          ...initialTargetStatus,
          tokenPaused,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admin data");
      setCapabilities(initialCapabilities);
      setTargetStatus(initialTargetStatus);
    } finally {
      setLoading(false);
    }
  }, [enabled, targetAddress, walletAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runWrite = useCallback(
    async (
      action: (contracts: ReturnType<typeof getWriteContracts>) => Promise<ContractTransactionResponse>
    ) => {
      if (!signer) {
        throw new Error("Connect wallet first.");
      }
      const contracts = getWriteContracts(signer);
      return action(contracts);
    },
    [signer]
  );

  const addInvestorWhitelist = useCallback(
    async (target: string) => {
      assertValidTarget(target);
      return runWrite(({ fundShareToken }) =>
        fundShareToken.setInvestorWhitelist(target, true)
      );
    },
    [runWrite]
  );

  const removeInvestorWhitelist = useCallback(
    async (target: string) => {
      assertValidTarget(target);
      return runWrite(({ fundShareToken }) =>
        fundShareToken.setInvestorWhitelist(target, false)
      );
    },
    [runWrite]
  );

  const addSystemWhitelist = useCallback(
    async (target: string) => {
      assertValidTarget(target);
      return runWrite(({ fundShareToken }) =>
        fundShareToken.setSystemWhitelist(target, true)
      );
    },
    [runWrite]
  );

  const removeSystemWhitelist = useCallback(
    async (target: string) => {
      assertValidTarget(target);
      return runWrite(({ fundShareToken }) =>
        fundShareToken.setSystemWhitelist(target, false)
      );
    },
    [runWrite]
  );

  const grantOperatorRole = useCallback(
    async (target: string) => {
      assertValidTarget(target);
      return runWrite(({ redemptionManager }) =>
        redemptionManager.grantRole(REDEMPTION_OPERATOR_ROLE, target)
      );
    },
    [runWrite]
  );

  const revokeOperatorRole = useCallback(
    async (target: string) => {
      assertValidTarget(target);
      return runWrite(({ redemptionManager }) =>
        redemptionManager.revokeRole(REDEMPTION_OPERATOR_ROLE, target)
      );
    },
    [runWrite]
  );

  const mintDemoFst = useCallback(
    async (target: string, amountWei: bigint) => {
      assertValidTarget(target);
      if (amountWei <= 0n) {
        throw new Error("Amount must be greater than 0.");
      }
      return runWrite(({ fundShareToken }) => fundShareToken.mint(target, amountWei));
    },
    [runWrite]
  );

  const pauseToken = useCallback(async () => {
    return runWrite(({ fundShareToken }) => fundShareToken.pause());
  }, [runWrite]);

  const unpauseToken = useCallback(async () => {
    return runWrite(({ fundShareToken }) => fundShareToken.unpause());
  }, [runWrite]);

  return {
    capabilities,
    targetStatus,
    loading,
    error,
    isValidTarget,
    refresh,
    addInvestorWhitelist,
    removeInvestorWhitelist,
    addSystemWhitelist,
    removeSystemWhitelist,
    grantOperatorRole,
    revokeOperatorRole,
    mintDemoFst,
    pauseToken,
    unpauseToken,
  };
}
