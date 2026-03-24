"use client";

import { useState } from "react";
import { parseUnits } from "ethers";
import { ActionCard } from "@/components/ActionCard";
import { useLocale } from "@/hooks/useLocale";

type Props = {
  disabled?: boolean;
  onApprove: (amountWei: bigint) => Promise<void>;
};

export function ApproveCard({ disabled = false, onApprove }: Props) {
  const { m } = useLocale();
  const [amount, setAmount] = useState("0");

  const submit = async () => {
    const normalized = amount.trim();
    if (!normalized || Number(normalized) <= 0) return;
    await onApprove(parseUnits(normalized, 18));
  };

  return (
    <ActionCard title={m.investor.approveTitle} description={m.investor.approveDescription}>
      <label className="block text-xs uppercase tracking-wide text-slate-400">{m.investor.amountLabel}</label>
      <input
        className="w-full rounded-lg border border-line bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-sky-300/45"
        type="number"
        min="0"
        step="any"
        value={amount}
        disabled={disabled}
        onChange={(event) => setAmount(event.target.value)}
      />
      <button className="btn-primary w-full" disabled={disabled} onClick={() => void submit()}>
        {m.investor.approveButton}
      </button>
    </ActionCard>
  );
}
