"use client";

import { useLocale } from "@/hooks/useLocale";

const TELEGRAM_URL = "https://t.me/mantaminjae";
const TELEGRAM_HANDLE = "@mantaminjae";

type Props = {
  title?: string;
  compact?: boolean;
};

export function DemoAccessCard({ title, compact = false }: Props) {
  const { m } = useLocale();

  return (
    <section className="panel p-6">
      <h3 className="text-lg font-semibold text-slate-100">
        {title ?? m.common.demoAccessTitle}
      </h3>
      <p className="mt-2 text-sm text-slate-300">{m.common.demoAccessDescription}</p>

      <ul className="mt-3 grid gap-2 text-sm text-slate-300">
        {m.common.demoAccessPoints.map((point) => (
          <li key={point} className="rounded-lg border border-line bg-slate-900/45 px-3 py-2">
            {point}
          </li>
        ))}
      </ul>

      <div className={compact ? "mt-3" : "mt-4 flex flex-wrap items-center gap-3"}>
        <div className="text-xs text-slate-400">
          {m.common.telegramHandleLabel}:{" "}
          <span className="font-mono text-slate-200">{TELEGRAM_HANDLE}</span>
        </div>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-primary inline-flex"
        >
          {m.common.telegramButton}
        </a>
      </div>
      <div className="mt-2 text-xs text-slate-400">
        {m.common.telegramLinkLabel}:{" "}
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="text-sky-300 hover:text-sky-200"
        >
          {TELEGRAM_URL}
        </a>
      </div>
    </section>
  );
}
