"use client";

import { AccessStateCard } from "@/components/common/AccessStateCard";
import { ContractInfoCard } from "@/components/ContractInfoCard";
import { StatCard } from "@/components/StatCard";
import { StepFlowCard } from "@/components/StepFlowCard";
import { RecentRequestsTable } from "@/components/dashboard/RecentRequestsTable";
import { CONTRACT_CONFIG } from "@/config/contracts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLocale } from "@/hooks/useLocale";
import { useWallet } from "@/hooks/useWallet";
import { formatTokenAmount, shortenAddress } from "@/lib/format";

export default function DashboardPage() {
  const { m } = useLocale();
  const { address, isConnected, connectWallet } = useWallet();
  const { data, loading, error } = useDashboardData();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-slate-100">{m.dashboard.title}</h2>
        <p className="mt-1 text-sm text-slate-400">{m.dashboard.description}</p>
      </section>

      {!isConnected ? (
        <AccessStateCard
          title={m.dashboard.disconnectedTitle}
          description={m.dashboard.disconnectedDescription}
          actionLabel={m.topbar.connect}
          onAction={() => void connectWallet()}
        />
      ) : null}

      {error ? (
        <section className="rounded-lg border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={m.dashboard.totalSupply}
          value={loading ? m.common.loading : `${formatTokenAmount(data.totalSupply)} FST`}
          hint={m.dashboard.supplyHint}
        />
        <StatCard
          label={m.dashboard.escrowBalance}
          value={loading ? m.common.loading : `${formatTokenAmount(data.escrowBalance)} FST`}
          hint={m.dashboard.escrowHint}
        />
        <StatCard
          label={m.dashboard.nextRequestId}
          value={loading ? m.common.loading : `#${data.nextRequestId.toString()}`}
          hint={m.dashboard.requestIdHint}
        />
        <StatCard
          label={m.common.connectedWallet}
          value={shortenAddress(address)}
          hint={m.dashboard.walletHint}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ContractInfoCard
          fundShareToken={CONTRACT_CONFIG.fundShareTokenAddress || m.common.notConfigured}
          redemptionManager={CONTRACT_CONFIG.redemptionManagerAddress || m.common.notConfigured}
          systemWhitelisted={data.systemWhitelisted}
          burnerRoleGranted={data.burnerRoleGranted}
        />

        <StepFlowCard
          title={m.dashboard.lifecycleOverview}
          description={m.dashboard.lifecycleDescription}
          steps={m.dashboard.steps}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-100">{m.dashboard.recentRequests}</h3>
        <RecentRequestsTable rows={data.recentRequests} />
      </section>
    </div>
  );
}
