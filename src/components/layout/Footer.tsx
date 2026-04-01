import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] mt-20">
      <div className="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
