import { useLocale } from "@/hooks/useLocale";
import { statusTone } from "@/lib/format";
import type { RedemptionStatus } from "@/lib/types";

type StatusBadgeProps = {
  status: RedemptionStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { m } = useLocale();

  return (
    <span
      className={`inline-flex min-w-24 justify-center rounded-full border px-3 py-1 text-xs font-medium ${statusTone(
        status
      )}`}
    >
      {m.status[status]}
    </span>
  );
}
