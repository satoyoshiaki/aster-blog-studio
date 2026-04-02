import type { Metadata } from "next";
import Link from "next/link";

import { AgeGate } from "@/components/night-bottle/age-gate";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Night Bottle",
    template: "%s | Night Bottle",
  },
  description: "匿名でおすすめ作品を交換する Next.js 14 Web アプリ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-black text-foreground" data-age-gate="locked">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <AgeGate />
            <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                <div>
                  <Link className="font-display text-3xl font-semibold text-white" href="/">
                    Night Bottle
                  </Link>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    Anonymous Recommendation Exchange
                  </p>
                </div>
                <nav className="flex items-center gap-4 text-sm text-zinc-300">
                  <Link className="transition hover:text-white" href="/history">
                    履歴
                  </Link>
                  <Link className="transition hover:text-white" href="/admin">
                    Admin
                  </Link>
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-white/10 bg-black/80">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>Night Bottle. Adult-only anonymous recommendation exchange.</p>
                <div className="flex flex-wrap gap-4">
                  <Link className="hover:text-white" href="/terms">
                    利用規約
                  </Link>
                  <Link className="hover:text-white" href="/privacy">
                    プライバシー
                  </Link>
                  <Link className="hover:text-white" href="/takedown">
                    削除依頼
                  </Link>
                  <Link className="hover:text-white" href="/history">
                    履歴
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
