"use client";

import { useRef, useState } from "react";
import type { Category, Tag } from "@prisma/client";

import { slugify } from "@/lib/utils";
import type { PostFormState } from "@/types";

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] text-sm";

const labelCls = "block text-sm text-[hsl(var(--muted-foreground))] mb-1.5";

interface PostFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Partial<PostFormState>;
  categories: Category[];
  tags: Tag[];
}

export function PostForm({ action, defaultValues, categories, tags }: PostFormProps) {
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const isEditing = Boolean(defaultValues?.id);
  const titleRef = useRef<HTMLInputElement>(null);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEditing) {
      setSlug(slugify(e.target.value));
    }
  }

  return (
    <form action={action} className="space-y-6 max-w-2xl">
      <div>
        <label className={labelCls}>Title</label>
        <input
          ref={titleRef}
          name="title"
          defaultValue={defaultValues?.title}
          onChange={handleTitleChange}
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
        <label className={labelCls}>Excerpt</label>
        <textarea
          name="excerpt"
          defaultValue={defaultValues?.excerpt}
          required
          rows={2}
          className={inputCls + " resize-none"}
        />
      </div>

      <div>
        <label className={labelCls}>Content</label>
        <textarea
          name="content"
          defaultValue={defaultValues?.content}
          required
          rows={14}
          className={inputCls + " resize-y"}
        />
      </div>

      <div>
        <label className={labelCls}>Thumbnail URL</label>
        <input
          name="thumbnailUrl"
          type="url"
          defaultValue={defaultValues?.thumbnailUrl}
          placeholder="https://images.unsplash.com/..."
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Status</label>
          <select
            name="status"
            defaultValue={defaultValues?.status ?? "DRAFT"}
            className={inputCls}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select
            name="categoryId"
            defaultValue={defaultValues?.categoryId ?? ""}
            required
            className={inputCls}
          >
            <option value="" disabled>
              Select category…
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tags.length > 0 && (
        <div>
          <label className={labelCls}>Tags</label>
          <div className="flex flex-wrap gap-3 mt-1">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className="flex items-center gap-1.5 text-sm cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={defaultValues?.tagIds?.includes(tag.id)}
                  className="accent-[hsl(var(--primary))]"
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="px-5 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {isEditing ? "Update Post" : "Create Post"}
      </button>
    </form>
  );
}
