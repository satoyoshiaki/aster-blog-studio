import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/lib/utils";
import type { PostWithRelations } from "@/types";

export function PostCard({ post }: { post: PostWithRelations }) {
  const tags = post.postTags.map((pt) => pt.tag);

  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 hover:border-[hsl(var(--primary)/0.4)] transition-colors">
      {post.thumbnailUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <Link
          href={`/blog/category/${post.category.slug}`}
          className="hover:text-[hsl(var(--primary))] transition-colors"
        >
          {post.category.name}
        </Link>
        <span>·</span>
        <time>{formatDate(post.publishedAt)}</time>
      </div>

      <Link href={`/blog/${post.slug}`}>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
          {post.title}
        </h2>
      </Link>

      <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2">
        {post.excerpt}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/blog/tag/${tag.slug}`}
              className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:opacity-80 transition-opacity"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
