"use client";

import { getWriteContracts } from "@/lib/contracts";
import { AccessStateCard } from "@/components/common/AccessStateCard";
import { DemoAccessCard } from "@/components/common/DemoAccessCard";
import { TransactionModal } from "@/components/common/TransactionModal";
import { ApproveCard } from "@/components/investor/ApproveCard";
import { MyRequestsTable } from "@/components/investor/MyRequestsTable";
import { RequestRedemptionCard } from "@/components/investor/RequestRedemptionCard";
import { StatCard } from "@/components/StatCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useInvestorData } from "@/hooks/useInvestorData";
import { useLocale } from "@/hooks/useLocale";
import { useTransactionAction } from "@/hooks/useTransactionAction";
import { useWallet } from "@/hooks/useWallet";
import { formatTokenAmount, shortenAddress } from "@/lib/format";

export default function InvestorPage() {
  const { m } = useLocale();
  const { isConnected, connectWallet, address, signer, isWrongNetwork } = useWallet();
  const { data, loading, error, refresh } = useInvestorData(address, isConnected);
  const dashboard = useDashboardData();
  const tx = useTransactionAction();

  const refreshAll = async () => {
    await Promise.all([refresh(), dashboard.refresh()]);
  };

  const handleApprove = async (amountWei: bigint) => {
    if (!signer) return;

    await tx.run(async () => {
      const { fundShareToken, redemptionManager } = getWriteContracts(signer);
      return fundShareToken.approve(await redemptionManager.getAddress(), amountWei);
    }, m.investor.approveButton);

    await refreshAll();
  };

  const handleRequest = async (amountWei: bigint) => {
    if (!signer) return;

    await tx.run(async () => {
      const { redemptionManager } = getWriteContracts(signer);
      return redemptionManager.requestRedemption(amountWei);
    }, m.investor.requestButton);

    await refreshAll();
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-slate-100">{m.investor.title}</h2>
        <p className="mt-1 text-sm text-slate-400">{m.investor.description}</p>
      </section>

      {!isConnected ? (
        <>
          <AccessStateCard
            title={m.common.connectRequiredTitle}
            description={m.common.connectRequiredDescription}
            actionLabel={m.topbar.connect}
            onAction={() => void connectWallet()}
          />
          <DemoAccessCard compact />
        </>
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
      ) : !data.isInvestorWhitelisted ? (
        <>
          <AccessStateCard
            title={m.common.restrictedTitle}
            description={m.investor.notWhitelistedDescription}
          />
          <DemoAccessCard compact />
        </>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              label={m.investor.balance}
              value={`${formatTokenAmount(data.balance)} FST`}
              hint={shortenAddress(address, 10, 8)}
            />
            <StatCard
              label={m.investor.allowance}
              value={`${formatTokenAmount(data.allowance)} FST`}
              hint={m.investor.allowanceHint}
            />
            <StatCard
              label={m.investor.whitelistStatus}
              value={m.investor.whitelisted}
              hint={m.investor.whitelistHint}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ApproveCard disabled={tx.isPending} onApprove={handleApprove} />
            <RequestRedemptionCard disabled={tx.isPending} onRequest={handleRequest} />
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100">{m.investor.myRequests}</h3>
            <MyRequestsTable rows={data.myRequests} />
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
          void refreshAll();
        }}
      />
    </div>
  );
}
