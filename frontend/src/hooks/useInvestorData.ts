"use client";

import { useCallback, useEffect, useState } from "react";
import { CONTRACT_CONFIG } from "@/config/contracts";
import { getReadContracts } from "@/lib/contracts";
import { filterMyRequests, readAllRequests } from "@/lib/requests";
import type { InvestorData } from "@/lib/types";

const initialData: InvestorData = {
  balance: 0n,
  allowance: 0n,
  isInvestorWhitelisted: false,
  myRequests: [],
};

export function useInvestorData(address?: string, enabled = false) {
  const [data, setData] = useState<InvestorData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    if (!enabled || !address) {
      setData(initialData);
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const { fundShareToken, redemptionManager } = getReadContracts();

      const [balance, allowance, isInvestorWhitelisted, nextRequestId] = await Promise.all([
        fundShareToken.balanceOf(address) as Promise<bigint>,
        fundShareToken.allowance(address, CONTRACT_CONFIG.redemptionManagerAddress) as Promise<bigint>,
        fundShareToken.isInvestorWhitelisted(address) as Promise<boolean>,
        redemptionManager.getNextRequestId() as Promise<bigint>,
      ]);

      const allRequests = isInvestorWhitelisted
        ? await readAllRequests(
            redemptionManager as unknown as {
              getRequest: (id: bigint) => Promise<any>;
            },
            nextRequestId
          )
        : [];

      setData({
        balance,
        allowance,
        isInvestorWhitelisted,
        myRequests: filterMyRequests(allRequests, address),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load investor data";
      setError(message);
      setData(initialData);
    } finally {
      setLoading(false);
    }
  }, [address, enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
