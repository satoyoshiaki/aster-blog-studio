import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getPostBySlug } from "@/lib/data";
import { buildMetadata } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post || post.status !== "PUBLISHED") return {};
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post || post.status !== "PUBLISHED") notFound();

  const tags = post.postTags.map((pt) => pt.tag);

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-4">
          <Link
            href={`/blog/category/${post.category.slug}`}
            className="hover:text-[hsl(var(--primary))] transition-colors"
          >
            {post.category.name}
          </Link>
          <span>·</span>
          <time>{formatDate(post.publishedAt)}</time>
          <span>·</span>
          <span>{post.author.name}</span>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight mb-6">
          {post.title}
        </h1>

        <p className="text-[hsl(var(--muted-foreground))] text-lg mb-8">
          {post.excerpt}
        </p>

        {post.thumbnailUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-10">
            <Image
              src={post.thumbnailUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="whitespace-pre-wrap text-[hsl(var(--foreground)/0.9)] leading-relaxed">
          {post.content}
        </div>

        {tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-[hsl(var(--border))] flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className="text-xs px-3 py-1 rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:opacity-80 transition-opacity"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
