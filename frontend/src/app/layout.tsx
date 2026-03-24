import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { LocaleProvider } from "@/hooks/useLocale";
import { WalletProvider } from "@/hooks/useWallet";

export const metadata: Metadata = {
  title: "FundShare RWA Console",
  description: "Permissioned RWA fund-share protocol admin dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>
          <WalletProvider>
            <AppShell>{children}</AppShell>
          </WalletProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
