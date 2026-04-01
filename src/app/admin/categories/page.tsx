import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { requireAdmin } from "@/lib/auth";
import { createCategory, deleteCategory } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-8">Categories</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-4">
            All Categories
          </h2>
          {categories.length === 0 ? (
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              No categories yet.
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
                  {categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="border-b border-[hsl(var(--border))] last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{cat.name}</td>
                      <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                        {cat._count.posts}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteButton
                          id={cat.id}
                          action={deleteCategory}
                          label="category"
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
            New Category
          </h2>
          <CategoryForm action={createCategory} />
        </div>
      </div>
    </div>
  );
}
