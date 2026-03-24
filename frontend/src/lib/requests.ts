import { REDEMPTION_STATUS_LABELS } from "@/lib/constants";
import type { RedemptionRequest } from "@/lib/types";

function toStatus(code: number): RedemptionRequest["status"] {
  return (
    REDEMPTION_STATUS_LABELS[
      code as keyof typeof REDEMPTION_STATUS_LABELS
    ] ?? "Requested"
  );
}

export function normalizeRequest(raw: {
  id: bigint;
  requester: string;
  amount: bigint;
  requestedAt: bigint;
  status: number;
}): RedemptionRequest {
  const statusCode = Number(raw.status);

  return {
    id: Number(raw.id),
    requester: raw.requester,
    amount: raw.amount,
    requestedAt: raw.requestedAt,
    statusCode,
    status: toStatus(statusCode),
  };
}

export async function readAllRequests(
  redemptionManager: {
    getRequest: (id: bigint) => Promise<{
      id: bigint;
      requester: string;
      amount: bigint;
      requestedAt: bigint;
      status: number;
    }>;
  },
  nextRequestId: bigint
): Promise<RedemptionRequest[]> {
  if (nextRequestId <= 1n) return [];

  const ids: bigint[] = [];
  for (let id = 1n; id < nextRequestId; id += 1n) {
    ids.push(id);
  }

  const requests = await Promise.all(
    ids.map(async (id) => normalizeRequest(await redemptionManager.getRequest(id)))
  );

  return requests.sort((a, b) => b.id - a.id);
}

export function filterMyRequests(requests: RedemptionRequest[], address: string) {
  const lower = address.toLowerCase();
  return requests.filter((item) => item.requester.toLowerCase() === lower);
}
