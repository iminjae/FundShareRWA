"use client";

import { useCallback, useEffect, useState } from "react";
import { BURNER_ROLE } from "@/lib/constants";
import { getReadContracts } from "@/lib/contracts";
import { readAllRequests } from "@/lib/requests";
import type { DashboardData } from "@/lib/types";

const initialData: DashboardData = {
  totalSupply: 0n,
  escrowBalance: 0n,
  nextRequestId: 1n,
  systemWhitelisted: false,
  burnerRoleGranted: false,
  recentRequests: [],
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const { fundShareToken, redemptionManager } = getReadContracts();

      const [totalSupply, escrowBalance, nextRequestId, systemWhitelisted, burnerRoleGranted] =
        await Promise.all([
          fundShareToken.totalSupply() as Promise<bigint>,
          fundShareToken.balanceOf(await redemptionManager.getAddress()) as Promise<bigint>,
          redemptionManager.getNextRequestId() as Promise<bigint>,
          fundShareToken.isSystemWhitelisted(await redemptionManager.getAddress()) as Promise<boolean>,
          fundShareToken.hasRole(BURNER_ROLE, await redemptionManager.getAddress()) as Promise<boolean>,
        ]);

      const requests = await readAllRequests(
        redemptionManager as unknown as { getRequest: (id: bigint) => Promise<any> },
        nextRequestId
      );

      setData({
        totalSupply,
        escrowBalance,
        nextRequestId,
        systemWhitelisted,
        burnerRoleGranted,
        recentRequests: requests.slice(0, 8),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load dashboard data";
      setError(message);
      setData(initialData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
