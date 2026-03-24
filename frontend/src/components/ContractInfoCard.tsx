import { useLocale } from "@/hooks/useLocale";
import { shortenAddress } from "@/lib/format";

type ContractInfoCardProps = {
  fundShareToken: string;
  redemptionManager: string;
  systemWhitelisted: boolean;
  burnerRoleGranted: boolean;
};

function BooleanPill({ ok, label, yes, no }: { ok: boolean; label: string; yes: string; no: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-line bg-slate-900/45 px-3 py-2">
      <span className="text-sm text-slate-300">{label}</span>
      <span
        className={[
          "rounded-full border px-3 py-1 text-xs font-medium",
          ok
            ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
            : "border-rose-400/40 bg-rose-500/15 text-rose-200",
        ].join(" ")}
      >
        {ok ? yes : no}
      </span>
    </div>
  );
}

export function ContractInfoCard(props: ContractInfoCardProps) {
  const { m } = useLocale();
  const { fundShareToken, redemptionManager, systemWhitelisted, burnerRoleGranted } = props;

  return (
    <section className="panel p-5">
      <h3 className="text-lg font-semibold text-slate-100">{m.dashboard.contractOverview}</h3>
      <p className="mt-1 text-sm text-slate-400">{m.dashboard.description}</p>

      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex items-center justify-between rounded-lg border border-line bg-slate-900/45 px-3 py-2">
          <span className="text-slate-400">FundShareToken</span>
          <span className="font-mono text-slate-200">{shortenAddress(fundShareToken, 10, 8)}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-line bg-slate-900/45 px-3 py-2">
          <span className="text-slate-400">RedemptionManager</span>
          <span className="font-mono text-slate-200">{shortenAddress(redemptionManager, 10, 8)}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <BooleanPill
          ok={systemWhitelisted}
          label="System whitelist linkage"
          yes={m.operator.actions.completed}
          no={m.operator.actions.reject}
        />
        <BooleanPill
          ok={burnerRoleGranted}
          label="BURNER_ROLE linkage"
          yes={m.operator.actions.completed}
          no={m.operator.actions.reject}
        />
      </div>
    </section>
  );
}
