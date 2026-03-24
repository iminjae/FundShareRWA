"use client";

import { useLocale } from "@/hooks/useLocale";
import type { RedemptionStatus } from "@/lib/types";

export type RequestFilter = "All" | RedemptionStatus;

const tabs: RequestFilter[] = ["All", "Requested", "Approved", "Rejected", "Processed"];

type Props = {
  value: RequestFilter;
  onChange: (value: RequestFilter) => void;
  disabled?: boolean;
};

export function RequestFilterTabs({ value, onChange, disabled = false }: Props) {
  const { m } = useLocale();

  const tabLabel: Record<RequestFilter, string> = {
    All: m.operator.tabs.all,
    Requested: m.operator.tabs.requested,
    Approved: m.operator.tabs.approved,
    Rejected: m.operator.tabs.rejected,
    Processed: m.operator.tabs.processed,
  };

  return (
    <section className="panel p-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = value === tab;

          return (
            <button
              key={tab}
              disabled={disabled}
              className={[
                "rounded-lg border px-3 py-1.5 text-sm transition disabled:opacity-40",
                active
                  ? "border-sky-300/40 bg-sky-400/10 text-sky-200"
                  : "border-line bg-slate-900/55 text-slate-300 hover:border-slate-400",
              ].join(" ")}
              onClick={() => onChange(tab)}
            >
              {tabLabel[tab]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
