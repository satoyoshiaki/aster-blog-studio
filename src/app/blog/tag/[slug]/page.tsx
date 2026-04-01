import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/blog/PostCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getPostsByTagSlug } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const tag = await prisma.tag.findUnique({ where: { slug: params.slug } });
  if (!tag) return {};
  return buildMetadata({
    title: `#${tag.name}`,
    description: `Posts tagged with ${tag.name}`,
    path: `/blog/tag/${tag.slug}`,
  });
}

export default async function TagPage({
  params,
}: {
  params: { slug: string };
}) {
  const tag = await prisma.tag.findUnique({ where: { slug: params.slug } });
  if (!tag) notFound();

  const posts = await getPostsByTagSlug(params.slug);

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold mb-8">
          #{tag.name}
        </h1>
        {posts.length === 0 ? (
          <p className="text-[hsl(var(--muted-foreground))]">
            No posts with this tag yet.
          </p>
        ) : (
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
