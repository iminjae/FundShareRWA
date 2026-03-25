"use client";

import Link from "next/link";
import { AccessStateCard } from "@/components/common/AccessStateCard";
import { DemoAccessCard } from "@/components/common/DemoAccessCard";
import { useLocale } from "@/hooks/useLocale";
import { useWallet } from "@/hooks/useWallet";
import { NETWORK_SETUP } from "@/config/network";

export default function HomePage() {
  const { m } = useLocale();
  const { connectWallet, isConnected } = useWallet();

  return (
    <div className="space-y-6">
      <section className="panel p-7">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold text-slate-100">{m.landing.heroTitle}</h2>
          <p className="mt-3 text-sm text-slate-300">{m.landing.heroSubtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/dashboard">
              {m.landing.ctaDashboard}
            </Link>
            {!isConnected ? (
              <button className="btn-secondary" onClick={() => void connectWallet()}>
                {m.landing.ctaConnect}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <h3 className="text-xl font-semibold text-slate-100">{m.landing.overviewTitle}</h3>
        <ul className="mt-4 grid gap-2 text-sm text-slate-300">
          {m.landing.overviewItems.map((item) => (
            <li key={item} className="rounded-lg border border-line bg-slate-900/40 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <DemoAccessCard title={m.landing.howToTestTitle} />

      <section className="grid gap-4 xl:grid-cols-2">
        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-slate-100">{m.landing.walletGuideTitle}</h3>
          <ol className="mt-4 grid gap-2 text-sm text-slate-300">
            {m.landing.walletGuideSteps.map((step, idx) => (
              <li key={step} className="rounded-lg border border-line bg-slate-900/40 px-3 py-2">
                {idx + 1}. {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-slate-100">{m.landing.networkGuideTitle}</h3>
          <p className="mt-2 text-sm text-slate-300">{m.landing.networkGuideDescription}</p>

          <div className="mt-4 grid gap-2 text-sm text-slate-200">
            <div className="rounded-lg border border-line bg-slate-900/40 px-3 py-2">
              {m.landing.networkFields.networkName}: {NETWORK_SETUP.networkName}
            </div>
            <div className="rounded-lg border border-line bg-slate-900/40 px-3 py-2">
              {m.landing.networkFields.chainId}: {NETWORK_SETUP.chainId}
            </div>
            <div className="rounded-lg border border-line bg-slate-900/40 px-3 py-2 break-all">
              {m.landing.networkFields.rpcUrl}: {NETWORK_SETUP.rpcUrl || "-"}
            </div>
            <div className="rounded-lg border border-line bg-slate-900/40 px-3 py-2">
              {m.landing.networkFields.currency}: {NETWORK_SETUP.nativeCurrencySymbol}
            </div>
            <div className="rounded-lg border border-line bg-slate-900/40 px-3 py-2 break-all">
              {m.landing.networkFields.explorer}: {NETWORK_SETUP.explorerUrl}
            </div>
          </div>
        </section>
      </section>

      <section className="panel p-6">
        <h3 className="text-xl font-semibold text-slate-100">{m.landing.quickAccessTitle}</h3>
        <p className="mt-2 text-sm text-slate-300">{m.landing.quickAccessDescription}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Link className="rounded-xl border border-line bg-slate-900/50 px-4 py-4 text-sm text-slate-200 hover:border-sky-300/40" href="/dashboard">
            {m.landing.quickDashboard}
          </Link>
          <Link className="rounded-xl border border-line bg-slate-900/50 px-4 py-4 text-sm text-slate-200 hover:border-sky-300/40" href="/investor">
            {m.landing.quickInvestor}
          </Link>
          <Link className="rounded-xl border border-line bg-slate-900/50 px-4 py-4 text-sm text-slate-200 hover:border-sky-300/40" href="/operator">
            {m.landing.quickOperator}
          </Link>
        </div>
      </section>

      {!isConnected ? (
        <AccessStateCard
          title={m.common.connectRequiredTitle}
          description={m.common.connectRequiredDescription}
          actionLabel={m.topbar.connect}
          onAction={() => void connectWallet()}
        />
      ) : null}
    </div>
  );
}
