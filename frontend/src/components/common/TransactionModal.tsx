"use client";

import { useLocale } from "@/hooks/useLocale";
import type { TxStage } from "@/hooks/useTransactionAction";

type Props = {
  stage: TxStage;
  txHash?: string;
  error?: string;
  successMessage?: string;
  onClose: () => void;
};

export function TransactionModal({
  stage,
  txHash,
  error,
  successMessage,
  onClose,
}: Props) {
  const { m } = useLocale();

  if (stage === "idle") return null;

  const pending =
    stage === "awaiting_wallet" || stage === "submitted" || stage === "confirming";

  const stageLabel =
    stage === "awaiting_wallet"
      ? m.tx.awaiting_wallet
      : stage === "submitted"
      ? m.tx.submitted
      : stage === "confirming"
      ? m.tx.confirming
      : stage === "success"
      ? m.tx.success
      : m.tx.error;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-line bg-slate-900/95 p-5 shadow-glow">
        <div className="flex items-center gap-3">
          <div
            className={[
              "h-9 w-9 rounded-full border border-sky-400/40",
              pending ? "animate-spin border-t-sky-300" : "border-emerald-400/40",
            ].join(" ")}
          />
          <div>
            <h4 className="text-base font-semibold text-slate-100">{stageLabel}</h4>
            <p className="text-sm text-slate-400">
              {pending ? m.tx.pendingHelp : stage === "success" ? successMessage : error}
            </p>
          </div>
        </div>

        {txHash ? (
          <p className="mt-4 break-all rounded-lg border border-line bg-slate-950/60 px-3 py-2 font-mono text-xs text-slate-300">
            {txHash}
          </p>
        ) : null}

        {!pending ? (
          <div className="mt-5 flex justify-end">
            <button className="btn-secondary" onClick={onClose}>
              {m.tx.close}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
