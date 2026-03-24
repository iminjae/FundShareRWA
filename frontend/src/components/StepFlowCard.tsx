type StepFlowCardProps = {
  title: string;
  description: string;
  steps: string[];
};

export function StepFlowCard({ title, description, steps }: StepFlowCardProps) {
  return (
    <section className="panel p-5">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>

      <ol className="mt-5 grid gap-3">
        {steps.map((step, idx) => (
          <li key={step} className="flex items-start gap-3 rounded-lg border border-line bg-slate-900/35 px-3 py-3">
            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-sky-300/35 bg-sky-400/10 text-xs font-semibold text-sky-200">
              {idx + 1}
            </div>
            <p className="text-sm text-slate-200">{step}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
