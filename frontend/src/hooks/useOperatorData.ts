"use client";

import { useCallback, useEffect, useState } from "react";
import { REDEMPTION_OPERATOR_ROLE } from "@/lib/constants";
import { getReadContracts } from "@/lib/contracts";
import { readAllRequests } from "@/lib/requests";
import type { OperatorData } from "@/lib/types";

const initialData: OperatorData = {
  hasOperatorRole: false,
  escrowBalance: 0n,
  pendingCount: 0,
  requests: [],
};

export function useOperatorData(address?: string, enabled = false) {
  const [data, setData] = useState<OperatorData>(initialData);
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

      const [hasOperatorRole, nextRequestId, escrowBalance] = await Promise.all([
        redemptionManager.hasRole(REDEMPTION_OPERATOR_ROLE, address) as Promise<boolean>,
        redemptionManager.getNextRequestId() as Promise<bigint>,
        fundShareToken.balanceOf(await redemptionManager.getAddress()) as Promise<bigint>,
      ]);

      const requests = hasOperatorRole
        ? await readAllRequests(
            redemptionManager as unknown as {
              getRequest: (id: bigint) => Promise<any>;
            },
            nextRequestId
          )
        : [];

      const pendingCount = requests.filter(
        (request) => request.status === "Requested"
      ).length;

      setData({ hasOperatorRole, escrowBalance, pendingCount, requests });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load operator data";
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
