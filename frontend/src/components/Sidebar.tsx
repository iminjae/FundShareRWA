"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/hooks/useLocale";

export function Sidebar() {
  const pathname = usePathname();
  const { m } = useLocale();

  const navItems = [
    { href: "/dashboard", label: m.sidebar.dashboard },
    { href: "/investor", label: m.sidebar.investor },
    { href: "/operator", label: m.sidebar.operator },
  ];

  return (
    <aside className="w-full border-b border-line bg-bg-elevated/80 px-4 py-4 backdrop-blur-lg lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
      <div className="mb-6 hidden lg:block">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {m.sidebar.protocolConsole}
        </div>
        <Link href="/" className="mt-1 inline-block text-xl font-semibold text-slate-100 hover:text-sky-200">
          FundShare RWA
        </Link>
      </div>

      <nav className="flex gap-2 lg:flex-col">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "rounded-lg border px-3 py-2 text-sm transition",
                active
                  ? "border-sky-300/40 bg-sky-400/10 text-sky-200"
                  : "border-transparent text-slate-300 hover:border-line hover:bg-slate-800/45",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
