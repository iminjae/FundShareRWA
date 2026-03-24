import { DataTable, type Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useLocale } from "@/hooks/useLocale";
import { formatDateTime, formatTokenAmount } from "@/lib/format";
import type { RedemptionRequest } from "@/lib/types";

type Props = {
  rows: RedemptionRequest[];
};

export function MyRequestsTable({ rows }: Props) {
  const { m } = useLocale();

  const columns: Column<RedemptionRequest>[] = [
    {
      key: "id",
      header: m.table.requestId,
      render: (row) => <span className="font-mono">#{row.id}</span>,
    },
    {
      key: "amount",
      header: m.table.amount,
      render: (row) => `${formatTokenAmount(row.amount)} FST`,
    },
    {
      key: "status",
      header: m.table.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "requestedAt",
      header: m.table.requestedAt,
      render: (row) => formatDateTime(row.requestedAt),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      emptyText={m.table.emptyMy}
    />
  );
}
