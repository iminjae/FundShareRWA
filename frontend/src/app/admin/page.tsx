"use client";

import { useEffect, useState } from "react";
import { parseUnits } from "ethers";
import { AccessStateCard } from "@/components/common/AccessStateCard";
import { TransactionModal } from "@/components/common/TransactionModal";
import { StatCard } from "@/components/StatCard";
import { useAdminData } from "@/hooks/useAdminData";
import { useLocale } from "@/hooks/useLocale";
import { useTransactionAction } from "@/hooks/useTransactionAction";
import { useWallet } from "@/hooks/useWallet";
import { formatTokenAmount, shortenAddress } from "@/lib/format";

export default function AdminPage() {
  const { m } = useLocale();
  const { isConnected, connectWallet, address, signer, isWrongNetwork } = useWallet();
  const tx = useTransactionAction();

  const [targetAddress, setTargetAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("100");
  const [formError, setFormError] = useState<string>();

  const {
    capabilities,
    targetStatus,
    loading,
    error,
    isValidTarget,
    refresh,
    addInvestorWhitelist,
    removeInvestorWhitelist,
    addSystemWhitelist,
    removeSystemWhitelist,
    grantOperatorRole,
    revokeOperatorRole,
    mintDemoFst,
    pauseToken,
    unpauseToken,
  } = useAdminData({
    walletAddress: address,
    targetAddress,
    signer,
    enabled: isConnected && !isWrongNetwork,
  });

  useEffect(() => {
    if (!targetAddress && address) {
      setTargetAddress(address);
    }
  }, [address, targetAddress]);

  const canShowControls = capabilities.canAccessAdmin;

  const boolLabel = (value: boolean) => (value ? m.admin.yes : m.admin.no);

  const parseMintAmount = (): bigint | null => {
    try {
      const amount = parseUnits(mintAmount || "0", 18);
      if (amount <= 0n) return null;
      return amount;
    } catch {
      return null;
    }
  };

  const runAction = async (
    action: () => Promise<any>,
    successText: string,
    requiresTarget = true
  ) => {
    setFormError(undefined);

    if (requiresTarget && !isValidTarget) {
      setFormError(m.admin.invalidAddress);
      return;
    }

    await tx.run(action, successText);
    await refresh();
  };

  const runMint = async (target: string) => {
    setFormError(undefined);
    const amount = parseMintAmount();
    if (!amount) {
      setFormError(m.admin.amountRequired);
      return;
    }

    await tx.run(() => mintDemoFst(target, amount), m.admin.mintButton);
    await refresh();
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-slate-100">{m.admin.title}</h2>
        <p className="mt-1 text-sm text-slate-400">{m.admin.description}</p>
      </section>

      {!isConnected ? (
        <AccessStateCard
          title={m.common.connectRequiredTitle}
          description={m.common.connectRequiredDescription}
          actionLabel={m.topbar.connect}
          onAction={() => void connectWallet()}
        />
      ) : isWrongNetwork ? (
        <AccessStateCard
          title={m.common.wrongNetworkTitle}
          description={m.common.wrongNetworkDescription}
        />
      ) : loading ? (
        <section className="panel p-6 text-sm text-slate-300">{m.common.loading}</section>
      ) : error ? (
        <section className="rounded-lg border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </section>
      ) : !canShowControls ? (
        <AccessStateCard title={m.common.restrictedTitle} description={m.admin.noPermissionDescription} />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={m.admin.connectedWallet}
              value={shortenAddress(address)}
              hint={m.common.connectedWallet}
            />
            <StatCard
              label={m.admin.tokenAdminStatus}
              value={boolLabel(capabilities.fstDefaultAdmin || capabilities.fstCompliance)}
              hint={`DEFAULT_ADMIN: ${boolLabel(capabilities.fstDefaultAdmin)} / COMPLIANCE: ${boolLabel(capabilities.fstCompliance)}`}
            />
            <StatCard
              label={m.admin.redemptionAdminStatus}
              value={boolLabel(capabilities.rmDefaultAdmin)}
              hint="DEFAULT_ADMIN_ROLE"
            />
            <StatCard
              label={m.admin.minterStatus}
              value={boolLabel(capabilities.fstMinter)}
              hint={`PAUSER: ${boolLabel(capabilities.fstPauser)}`}
            />
          </section>

          <section className="panel p-5">
            <h3 className="text-lg font-semibold text-slate-100">{m.admin.targetAddress}</h3>
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <input
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value.trim())}
                placeholder={m.admin.targetPlaceholder}
                className="flex-1 rounded-lg border border-line bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-sky-300/40"
              />
              <button
                className="btn-secondary"
                disabled={tx.isPending || !address}
                onClick={() => setTargetAddress(address ?? "")}
              >
                {m.admin.useMyWallet}
              </button>
            </div>
            {formError ? <p className="mt-2 text-xs text-rose-300">{formError}</p> : null}
            {!isValidTarget && targetAddress ? (
              <p className="mt-2 text-xs text-rose-300">{m.admin.invalidAddress}</p>
            ) : null}
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <section className="panel p-5">
              <h3 className="text-lg font-semibold text-slate-100">{m.admin.roleAndAccessActions}</h3>

              <p className="mt-4 text-xs uppercase tracking-[0.12em] text-slate-400">{m.admin.whitelistActions}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button className="btn-primary disabled:opacity-50" disabled={tx.isPending || !isValidTarget} onClick={() => void runAction(() => addInvestorWhitelist(targetAddress), m.admin.addInvestor)}>
                  {m.admin.addInvestor}
                </button>
                <button className="btn-secondary disabled:opacity-50" disabled={tx.isPending || !isValidTarget} onClick={() => void runAction(() => removeInvestorWhitelist(targetAddress), m.admin.removeInvestor)}>
                  {m.admin.removeInvestor}
                </button>
                <button className="btn-primary disabled:opacity-50" disabled={tx.isPending || !isValidTarget} onClick={() => void runAction(() => addSystemWhitelist(targetAddress), m.admin.addSystem)}>
                  {m.admin.addSystem}
                </button>
                <button className="btn-secondary disabled:opacity-50" disabled={tx.isPending || !isValidTarget} onClick={() => void runAction(() => removeSystemWhitelist(targetAddress), m.admin.removeSystem)}>
                  {m.admin.removeSystem}
                </button>
              </div>

              <p className="mt-4 text-xs uppercase tracking-[0.12em] text-slate-400">{m.admin.operatorRoleActions}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button className="btn-primary disabled:opacity-50" disabled={tx.isPending || !isValidTarget} onClick={() => void runAction(() => grantOperatorRole(targetAddress), m.admin.grantOperator)}>
                  {m.admin.grantOperator}
                </button>
                <button className="btn-danger disabled:opacity-50" disabled={tx.isPending || !isValidTarget} onClick={() => void runAction(() => revokeOperatorRole(targetAddress), m.admin.revokeOperator)}>
                  {m.admin.revokeOperator}
                </button>
              </div>

              <p className="mt-4 text-xs uppercase tracking-[0.12em] text-slate-400">{m.admin.protocolControls}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <button className="btn-danger disabled:opacity-50" disabled={tx.isPending} onClick={() => void runAction(() => pauseToken(), m.admin.pauseToken, false)}>
                  {m.admin.pauseToken}
                </button>
                <button className="btn-secondary disabled:opacity-50" disabled={tx.isPending} onClick={() => void runAction(() => unpauseToken(), m.admin.unpauseToken, false)}>
                  {m.admin.unpauseToken}
                </button>
              </div>
            </section>

            <section className="panel p-5">
              <h3 className="text-lg font-semibold text-slate-100">{m.admin.mintSection}</h3>
              <div className="mt-3">
                <label className="text-xs uppercase tracking-[0.12em] text-slate-400">{m.admin.mintAmount}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-line bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-300/40"
                />
              </div>
              <button
                className="btn-primary mt-3 disabled:opacity-50"
                disabled={tx.isPending || !isValidTarget}
                onClick={() => void runMint(targetAddress)}
              >
                {m.admin.mintButton}
              </button>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-200">{m.admin.quickActions}</h4>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <button className="btn-secondary disabled:opacity-50" disabled={tx.isPending || !address} onClick={() => void runAction(() => addInvestorWhitelist(address ?? ""), m.admin.addMeInvestor, false)}>
                    {m.admin.addMeInvestor}
                  </button>
                  <button className="btn-secondary disabled:opacity-50" disabled={tx.isPending || !address} onClick={() => void runAction(() => removeInvestorWhitelist(address ?? ""), m.admin.removeMeInvestor, false)}>
                    {m.admin.removeMeInvestor}
                  </button>
                  <button className="btn-secondary disabled:opacity-50" disabled={tx.isPending || !address} onClick={() => void runAction(() => grantOperatorRole(address ?? ""), m.admin.grantMeOperator, false)}>
                    {m.admin.grantMeOperator}
                  </button>
                  <button className="btn-secondary disabled:opacity-50" disabled={tx.isPending || !address} onClick={() => void runAction(() => revokeOperatorRole(address ?? ""), m.admin.revokeMeOperator, false)}>
                    {m.admin.revokeMeOperator}
                  </button>
                  <button className="btn-primary disabled:opacity-50 sm:col-span-2" disabled={tx.isPending || !address} onClick={() => void runMint(address ?? "")}>
                    {m.admin.mintToMe}
                  </button>
                </div>
              </div>
            </section>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label={m.admin.investorWhitelisted}
              value={boolLabel(targetStatus.investorWhitelisted)}
              hint={m.admin.targetStatus}
            />
            <StatCard
              label={m.admin.systemWhitelisted}
              value={boolLabel(targetStatus.systemWhitelisted)}
              hint={m.admin.targetStatus}
            />
            <StatCard
              label={m.admin.operatorRole}
              value={boolLabel(targetStatus.operatorRole)}
              hint="REDEMPTION_OPERATOR_ROLE"
            />
            <StatCard
              label={m.admin.fstBalance}
              value={`${formatTokenAmount(targetStatus.balance)} FST`}
              hint={m.admin.targetStatus}
            />
            <StatCard
              label={m.admin.tokenPauseState}
              value={targetStatus.tokenPaused ? m.admin.paused : m.admin.notPaused}
              hint={m.admin.protocolControls}
            />
          </section>
        </>
      )}

      <TransactionModal
        stage={tx.stage}
        txHash={tx.txHash}
        error={tx.error}
        successMessage={tx.successMessage}
        onClose={() => {
          tx.reset();
          void refresh();
        }}
      />
    </div>
  );
}
