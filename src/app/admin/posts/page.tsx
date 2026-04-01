import { Plus } from "lucide-react";
import Link from "next/link";

import { DeleteButton } from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/auth";
import { deletePost } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminPostsPage() {
  await requireAdmin();

  const posts = await prisma.post.findMany({
    include: {
      author: { select: { name: true } },
      category: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-[hsl(var(--muted-foreground))]">No posts yet.</p>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                <th className="text-left px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Title
                </th>
                <th className="text-left px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                  Updated
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--card)/0.5)]"
                >
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                    {post.category.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        post.status === "PUBLISHED"
                          ? "bg-green-900/40 text-green-400"
                          : "bg-yellow-900/40 text-yellow-400"
                      }`}
                    >
                      {post.status === "PUBLISHED" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                    {formatDate(post.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        id={post.id}
                        action={deletePost}
                        label="post"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
