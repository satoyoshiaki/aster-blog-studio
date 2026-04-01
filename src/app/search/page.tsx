import type { Metadata } from "next";

import { PostCard } from "@/components/blog/PostCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { searchPosts } from "@/lib/data";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search posts on Aster Blog Studio.",
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";
  const posts = query ? await searchPosts(query) : [];

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold mb-8">
          Search
        </h1>

        <form method="GET" className="mb-10">
          <div className="flex gap-3 max-w-xl">
            <input
              name="q"
              defaultValue={query}
              placeholder="Search posts…"
              className="flex-1 px-4 py-2 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>
        </form>

        {query && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
            {posts.length} result{posts.length !== 1 ? "s" : ""} for &ldquo;
            {query}&rdquo;
          </p>
        )}

        {posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
