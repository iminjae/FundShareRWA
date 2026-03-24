"use client";

import type { Locale } from "@/i18n/messages";
import { useLocale } from "@/hooks/useLocale";

export function LanguageSwitcher() {
  const { locale, setLocale, m } = useLocale();

  const onChange = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-line bg-slate-900/60 p-1">
      <button
        className={[
          "rounded px-2 py-1 text-xs transition",
          locale === "en" ? "bg-sky-500/20 text-sky-100" : "text-slate-300",
        ].join(" ")}
        onClick={() => onChange("en")}
      >
        {m.language.en}
      </button>
      <button
        className={[
          "rounded px-2 py-1 text-xs transition",
          locale === "ko" ? "bg-sky-500/20 text-sky-100" : "text-slate-300",
        ].join(" ")}
        onClick={() => onChange("ko")}
      >
        {m.language.ko}
      </button>
    </div>
  );
}
