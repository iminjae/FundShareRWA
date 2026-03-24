import type { RedemptionStatusLabel } from "@/lib/constants";

export type RedemptionStatus = RedemptionStatusLabel;

export interface RedemptionRequest {
  id: number;
  requester: string;
  amount: bigint;
  requestedAt: bigint;
  statusCode: number;
  status: RedemptionStatus;
}

export interface DashboardData {
  totalSupply: bigint;
  escrowBalance: bigint;
  nextRequestId: bigint;
  systemWhitelisted: boolean;
  burnerRoleGranted: boolean;
  recentRequests: RedemptionRequest[];
}

export interface InvestorData {
  balance: bigint;
  allowance: bigint;
  isInvestorWhitelisted: boolean;
  myRequests: RedemptionRequest[];
}

export interface OperatorData {
  hasOperatorRole: boolean;
  escrowBalance: bigint;
  pendingCount: number;
  requests: RedemptionRequest[];
}
