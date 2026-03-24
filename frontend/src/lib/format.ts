import { formatUnits } from "ethers";
import { REDEMPTION_STATUS_TONE } from "@/lib/constants";
import type { RedemptionStatus } from "@/lib/types";

export function shortenAddress(address?: string, lead = 6, tail = 4): string {
  if (!address) return "Not connected";
  if (address.length <= lead + tail + 2) return address;
  return `${address.slice(0, lead)}...${address.slice(-tail)}`;
}

export function formatTokenAmount(value: string | bigint, decimals = 18, digits = 2): string {
  const normalized = typeof value === "bigint" ? formatUnits(value, decimals) : value;
  const numeric = Number.parseFloat(normalized);
  if (Number.isNaN(numeric)) return "0";
  return numeric.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function formatDateTime(value: bigint | number | string): string {
  const date =
    typeof value === "bigint" || typeof value === "number"
      ? new Date(Number(value) * 1000)
      : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const sec = String(date.getUTCSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec} UTC`;
}

export function statusTone(status: RedemptionStatus): string {
  return REDEMPTION_STATUS_TONE[status];
}
