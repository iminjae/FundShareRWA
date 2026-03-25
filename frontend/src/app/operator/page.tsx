"use client";

import { useMemo, useState } from "react";
import { AccessStateCard } from "@/components/common/AccessStateCard";
import { DemoAccessCard } from "@/components/common/DemoAccessCard";
import { TransactionModal } from "@/components/common/TransactionModal";
import { RequestFilterTabs, type RequestFilter } from "@/components/operator/RequestFilterTabs";
import { RedemptionQueueTable } from "@/components/operator/RedemptionQueueTable";
import { StatCard } from "@/components/StatCard";
import { getWriteContracts } from "@/lib/contracts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLocale } from "@/hooks/useLocale";
import { useOperatorData } from "@/hooks/useOperatorData";
import { useTransactionAction } from "@/hooks/useTransactionAction";
import { useWallet } from "@/hooks/useWallet";
import { formatTokenAmount } from "@/lib/format";

export default function OperatorPage() {
  const { m } = useLocale();
  const { isConnected, connectWallet, address, signer, isWrongNetwork } = useWallet();
  const { data, loading, error, refresh } = useOperatorData(address, isConnected);
  const dashboard = useDashboardData();
  const tx = useTransactionAction();
  const [filter, setFilter] = useState<RequestFilter>("All");

  const filteredRequests = useMemo(() => {
    if (filter === "All") return data.requests;
    return data.requests.filter((request) => request.status === filter);
  }, [data.requests, filter]);

  const refreshAll = async () => {
    await Promise.all([refresh(), dashboard.refresh()]);
  };

  const handleApprove = async (requestId: number) => {
    if (!signer) return;
    await tx.run(async () => {
      const { redemptionManager } = getWriteContracts(signer);
      return redemptionManager.approveRedemption(requestId);
    }, m.operator.actions.approve);

    await refreshAll();
  };

  const handleReject = async (requestId: number) => {
    if (!signer) return;
    await tx.run(async () => {
      const { redemptionManager } = getWriteContracts(signer);
      return redemptionManager.rejectRedemption(requestId);
    }, m.operator.actions.reject);

    await refreshAll();
  };

  const handleProcess = async (requestId: number) => {
    if (!signer) return;
    await tx.run(async () => {
      const { redemptionManager } = getWriteContracts(signer);
      return redemptionManager.processRedemption(requestId);
    }, m.operator.actions.process);

    await refreshAll();
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-slate-100">{m.operator.title}</h2>
        <p className="mt-1 text-sm text-slate-400">{m.operator.description}</p>
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
      ) : !data.hasOperatorRole ? (
        <>
          <AccessStateCard title={m.common.restrictedTitle} description={m.operator.noRoleDescription} />
          <DemoAccessCard compact />
        </>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label={m.operator.roleStatus} value={m.operator.roleActive} hint={m.operator.roleHint} />
            <StatCard
              label={m.operator.escrowedFst}
              value={`${formatTokenAmount(data.escrowBalance)} FST`}
              hint={m.dashboard.escrowHint}
            />
            <StatCard
              label={m.operator.pendingCount}
              value={`${data.pendingCount}`}
              hint={m.operator.pendingHint}
            />
          </section>

          <RequestFilterTabs value={filter} onChange={setFilter} disabled={tx.isPending} />

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-100">{m.operator.queueTitle}</h3>
            <RedemptionQueueTable
              rows={filteredRequests}
              disabled={tx.isPending}
              onApprove={handleApprove}
              onReject={handleReject}
              onProcess={handleProcess}
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
          void refreshAll();
        }}
      />
    </div>
  );
}
