import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/blog/PostCard";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getPostsByCategorySlug } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });
  if (!category) return {};
  return buildMetadata({
    title: category.name,
    description: `Posts in ${category.name}`,
    path: `/blog/category/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });
  if (!category) notFound();

  const posts = await getPostsByCategorySlug(params.slug);

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold mb-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-[hsl(var(--muted-foreground))] mb-10">
            {category.description}
          </p>
        )}
        {posts.length === 0 ? (
          <p className="text-[hsl(var(--muted-foreground))] mt-8">
            No posts in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
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
