import { FileText, FolderOpen, LogOut, Tag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const navItems = [
    { href: "/admin/posts", label: "Posts", icon: FileText },
    { href: "/admin/categories", label: "Categories", icon: FolderOpen },
    { href: "/admin/tags", label: "Tags", icon: Tag },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] flex flex-col">
        <div className="p-5 border-b border-[hsl(var(--border))]">
          <p className="font-[family-name:var(--font-display)] text-base font-semibold">
            Admin Panel
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 truncate">
            {session.user.email}
          </p>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-[hsl(var(--border))]">
          <a
            href="/api/auth/signout"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </a>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
