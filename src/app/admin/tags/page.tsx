import { DeleteButton } from "@/components/admin/DeleteButton";
import { TagForm } from "@/components/admin/TagForm";
import { requireAdmin } from "@/lib/auth";
import { createTag, deleteTag } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function AdminTagsPage() {
  await requireAdmin();

  const tags = await prisma.tag.findMany({
    include: { _count: { select: { postTags: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Tags</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-4">
            All Tags
          </h2>
          {tags.length === 0 ? (
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              No tags yet.
            </p>
          ) : (
            <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                    <th className="text-left px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-[hsl(var(--muted-foreground))]">
                      Posts
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => (
                    <tr
                      key={tag.id}
                      className="border-b border-[hsl(var(--border))] last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{tag.name}</td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {tag._count.postTags}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteButton
                          id={tag.id}
                          action={deleteTag}
                          label="tag"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-4">
            New Tag
          </h2>
          <TagForm action={createTag} />
        </div>
      </div>
    </div>
  );
}
