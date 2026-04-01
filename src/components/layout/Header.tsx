import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="border-b border-[hsl(var(--border))] sticky top-0 z-50 bg-[hsl(var(--background)/0.85)] backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight"
        >
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
          <Link href="/" className="hover:text-[hsl(var(--foreground))] transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-[hsl(var(--foreground))] transition-colors">
            About
          </Link>
          <Link href="/search" className="hover:text-[hsl(var(--foreground))] transition-colors">
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}
