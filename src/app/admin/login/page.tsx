"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { siteConfig } from "@/lib/site";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/admin/posts");
    }
  }

  const inputCls =
    "w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-center mb-8">
          {siteConfig.name}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6"
        >
          <h2 className="text-base font-medium">Sign in</h2>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div>
            <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1.5">
              Email
            </label>
            <input name="email" type="email" required className={inputCls} />
          </div>

          <div>
            <label className="block text-sm text-[hsl(var(--muted-foreground))] mb-1.5">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
