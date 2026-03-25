import { ethers } from "ethers";

export const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;
export const COMPLIANCE_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("COMPLIANCE_ROLE")
);
export const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
export const PAUSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));
export const BURNER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("BURNER_ROLE"));
export const REDEMPTION_OPERATOR_ROLE = ethers.keccak256(
  ethers.toUtf8Bytes("REDEMPTION_OPERATOR_ROLE")
);

export const REDEMPTION_STATUS_LABELS = {
  0: "Requested",
  1: "Approved",
  2: "Rejected",
  3: "Processed",
} as const;

export type RedemptionStatusCode = keyof typeof REDEMPTION_STATUS_LABELS;
export type RedemptionStatusLabel =
  (typeof REDEMPTION_STATUS_LABELS)[RedemptionStatusCode];

export const REDEMPTION_STATUS_TONE: Record<RedemptionStatusLabel, string> = {
  Requested: "bg-amber-500/15 text-amber-300 border-amber-400/40",
  Approved: "bg-blue-500/15 text-blue-300 border-blue-400/40",
  Rejected: "bg-rose-500/15 text-rose-300 border-rose-400/40",
  Processed: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
};
