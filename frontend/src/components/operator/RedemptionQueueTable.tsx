import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useLocale } from "@/hooks/useLocale";
import { formatDateTime, formatTokenAmount, shortenAddress } from "@/lib/format";
import type { RedemptionRequest } from "@/lib/types";

type Props = {
  rows: RedemptionRequest[];
  disabled?: boolean;
  onApprove: (requestId: number) => Promise<void>;
  onReject: (requestId: number) => Promise<void>;
  onProcess: (requestId: number) => Promise<void>;
};

export function RedemptionQueueTable({
  rows,
  disabled = false,
  onApprove,
  onReject,
  onProcess,
}: Props) {
  const { m } = useLocale();

  const columns: Column<RedemptionRequest>[] = [
    {
      key: "id",
      header: m.table.requestId,
      render: (row) => <span className="font-mono">#{row.id}</span>,
    },
    {
      key: "requester",
      header: m.table.requester,
      render: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {shortenAddress(row.requester, 10, 8)}
        </span>
      ),
    },
    {
      key: "amount",
      header: m.table.amount,
      render: (row) => `${formatTokenAmount(row.amount)} FST`,
    },
    {
      key: "requestedAt",
      header: m.table.requestedAt,
      render: (row) => formatDateTime(row.requestedAt),
    },
    {
      key: "status",
      header: m.table.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: m.table.actions,
      render: (row) => {
        if (row.status === "Requested") {
          return (
            <div className="flex gap-2">
              <button
                className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
                disabled={disabled}
                onClick={() => void onApprove(row.id)}
              >
                {m.operator.actions.approve}
              </button>
              <button
                className="btn-danger px-3 py-1.5 text-xs disabled:opacity-50"
                disabled={disabled}
                onClick={() => void onReject(row.id)}
              >
                {m.operator.actions.reject}
              </button>
            </div>
          );
        }

        if (row.status === "Approved") {
          return (
            <div className="flex gap-2">
              <button
                className="btn-primary px-3 py-1.5 text-xs disabled:opacity-50"
                disabled={disabled}
                onClick={() => void onProcess(row.id)}
              >
                {m.operator.actions.process}
              </button>
              <button
                className="btn-danger px-3 py-1.5 text-xs disabled:opacity-50"
                disabled={disabled}
                onClick={() => void onReject(row.id)}
              >
                {m.operator.actions.reject}
              </button>
            </div>
          );
        }

        if (row.status === "Processed") {
          return <span className="text-xs text-emerald-300">{m.operator.actions.completed}</span>;
        }

        return <span className="text-xs text-slate-500">{m.operator.actions.dash}</span>;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      emptyText={m.table.emptyQueue}
    />
  );
}
