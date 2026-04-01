import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostForm } from "@/components/admin/PostForm";
import { requireAdmin } from "@/lib/auth";
import { updatePost } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const [post, categories, tags] = await Promise.all([
    prisma.post.findUnique({
      where: { id: params.id },
      include: { postTags: { select: { tagId: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  const updatePostWithId = updatePost.bind(null, post.id);

  return (
    <div>
      <Link
        href="/admin/posts"
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6 transition-colors w-fit"
      >
        <ChevronLeft size={14} />
        Posts
      </Link>

      <h1 className="text-2xl font-semibold mb-8">Edit Post</h1>

      <PostForm
        action={updatePostWithId}
        categories={categories}
        tags={tags}
        defaultValues={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          thumbnailUrl: post.thumbnailUrl ?? "",
          status: post.status,
          categoryId: post.categoryId,
          tagIds: post.postTags.map((pt) => pt.tagId),
        }}
      />
    </div>
  );
}
