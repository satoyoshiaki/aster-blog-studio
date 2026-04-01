import Link from "next/link";

import { PostCard } from "@/components/blog/PostCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCategoriesWithCounts, getFeaturedPosts } from "@/lib/data";
import { siteConfig } from "@/lib/site";

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    getFeaturedPosts(6),
    getCategoriesWithCounts(),
  ]);

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <section className="mb-16 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold mb-4 tracking-tight">
            {siteConfig.name}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-xl mx-auto">
            {siteConfig.description}
          </p>
        </section>

        <div className="flex gap-10">
          <section className="flex-1 min-w-0">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-6">
              Latest Posts
            </h2>
            {posts.length === 0 ? (
              <p className="text-[hsl(var(--muted-foreground))]">No posts yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>

          <aside className="w-52 shrink-0 hidden md:block">
            <h2 className="text-xs font-medium uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-4">
              Categories
            </h2>
            <ul className="flex flex-col gap-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/blog/category/${cat.slug}`}
                    className="flex items-center justify-between text-sm hover:text-[hsl(var(--primary))] transition-colors"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[hsl(var(--muted-foreground))]">
                      {cat._count.posts}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
