"use client";

import { useState } from "react";
import type { Category } from "@prisma/client";

import { slugify } from "@/lib/utils";

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm";

const labelCls = "block text-sm text-[hsl(var(--muted-foreground))] mb-1.5";

interface CategoryFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<Category>;
}

export function CategoryForm({ action, defaultValues }: CategoryFormProps) {
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const isEditing = Boolean(defaultValues?.id);

  return (
    <form action={action} className="space-y-4 max-w-md">
      <div>
        <label className={labelCls}>Name</label>
        <input
          name="name"
          defaultValue={defaultValues?.name}
          onChange={(e) => {
            if (!isEditing) setSlug(slugify(e.target.value));
          }}
          required
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          rows={2}
          className={inputCls + " resize-none"}
        />
      </div>
      <button
        type="submit"
        className="px-5 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {isEditing ? "Update" : "Create"} Category
      </button>
    </form>
  );
}
