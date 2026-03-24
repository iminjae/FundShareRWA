import type { ReactNode } from "react";

type ActionCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function ActionCard({ title, description, children }: ActionCardProps) {
  return (
    <section className="panel p-5">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}
