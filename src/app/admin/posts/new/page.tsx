import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { PostForm } from "@/components/admin/PostForm";
import { requireAdmin } from "@/lib/auth";
import { createPost } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function NewPostPage() {
  await requireAdmin();

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <Link
        href="/admin/posts"
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6 transition-colors w-fit"
      >
        <ChevronLeft size={14} />
        Posts
      </Link>

      <h1 className="text-2xl font-semibold mb-8">New Post</h1>

      <PostForm action={createPost} categories={categories} tags={tags} />
    </div>
  );
}
