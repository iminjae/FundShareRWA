type AccessStateCardProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AccessStateCard({
  title,
  description,
  actionLabel,
  onAction,
}: AccessStateCardProps) {
  return (
    <section className="panel p-6">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>

      {actionLabel && onAction ? (
        <button className="btn-primary mt-4" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
