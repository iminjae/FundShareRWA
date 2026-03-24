"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useLocale } from "@/hooks/useLocale";
import { useWallet } from "@/hooks/useWallet";
import { shortenAddress } from "@/lib/format";

export function Topbar() {
  const { m } = useLocale();
  const {
    address,
    chainName,
    isConnected,
    connectWallet,
    disconnectWallet,
    hasProvider,
    isWrongNetwork,
  } = useWallet();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg-base/85 px-4 py-3 backdrop-blur-lg lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="group">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-300">
            {m.topbar.protocolLabel}
          </div>
          <div className="text-lg font-semibold text-slate-100 group-hover:text-sky-200">
            {m.topbar.title}
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="rounded-lg border border-line bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
            {chainName || m.topbar.unknownNetwork}
          </div>
          <div className="rounded-lg border border-line bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
            {shortenAddress(address)}
          </div>
          {isWrongNetwork ? (
            <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {m.topbar.wrongNetwork}
            </div>
          ) : null}
          {!isConnected ? (
            <button
              className="btn-primary"
              disabled={!hasProvider}
              onClick={() => void connectWallet()}
              title={!hasProvider ? m.topbar.noWallet : undefined}
            >
              {m.topbar.connect}
            </button>
          ) : (
            <button className="btn-secondary" onClick={disconnectWallet}>
              {m.topbar.disconnect}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
