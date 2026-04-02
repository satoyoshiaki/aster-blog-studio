import type { Metadata } from "next";

import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mirror 16",
    template: "%s | Mirror 16",
  },
  description: "Multilingual MBTI-inspired 16-type personality quiz built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(244,63,94,0.14),transparent_32%)]" />
            <main className="relative z-10 flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
