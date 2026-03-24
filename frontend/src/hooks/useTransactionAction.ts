"use client";

import { useCallback, useState } from "react";
import type { ContractTransactionResponse } from "ethers";
import { toReadableError } from "@/lib/errors";

export type TxStage =
  | "idle"
  | "awaiting_wallet"
  | "submitted"
  | "confirming"
  | "success"
  | "error";

export function useTransactionAction() {
  const [stage, setStage] = useState<TxStage>("idle");
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  const isPending =
    stage === "awaiting_wallet" || stage === "submitted" || stage === "confirming";

  const reset = useCallback(() => {
    setStage("idle");
    setTxHash(undefined);
    setError(undefined);
    setSuccessMessage(undefined);
  }, []);

  const run = useCallback(
    async (
      action: () => Promise<ContractTransactionResponse>,
      successText = "Transaction confirmed."
    ) => {
      setError(undefined);
      setSuccessMessage(undefined);
      setTxHash(undefined);
      setStage("awaiting_wallet");

      try {
        const tx = await action();
        setTxHash(tx.hash);
        setStage("submitted");

        setStage("confirming");
        await tx.wait();

        setSuccessMessage(successText);
        setStage("success");
      } catch (e) {
        setError(toReadableError(e));
        setStage("error");
      }
    },
    []
  );

  return {
    stage,
    txHash,
    error,
    successMessage,
    isPending,
    run,
    reset,
  };
}
