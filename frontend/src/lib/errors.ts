export function toReadableError(error: unknown): string {
  const err = error as {
    code?: string | number;
    shortMessage?: string;
    reason?: string;
    message?: string;
    info?: { error?: { message?: string } };
  };

  const message =
    err?.shortMessage ||
    err?.reason ||
    err?.info?.error?.message ||
    err?.message ||
    "Unknown error";

  if (err?.code === 4001 || err?.code === "ACTION_REJECTED") {
    return "User rejected the wallet request.";
  }

  if (/wrong network|chain/i.test(message)) {
    return "Wrong network selected. Please switch to the configured chain.";
  }

  if (/insufficient balance/i.test(message)) {
    return "Insufficient balance for this action.";
  }

  if (/insufficient allowance/i.test(message)) {
    return "Insufficient allowance. Approve token access first.";
  }

  if (/AccessControlUnauthorizedAccount|access control/i.test(message)) {
    return "Access denied: this wallet does not have required permissions.";
  }

  if (/AddressNotAllowed|InvalidTransferRoute/i.test(message)) {
    return "Transfer route is not allowed by whitelist rules.";
  }

  return message.replace("execution reverted: ", "");
}
