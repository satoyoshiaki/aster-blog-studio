"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

// ─── Post actions ────────────────────────────────────────────────────────────

const PostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  categoryId: z.string().min(1, "Category is required"),
  tagIds: z.array(z.string()),
});

export async function createPost(formData: FormData) {
  const session = await requireAdmin();

  const data = PostSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    thumbnailUrl: formData.get("thumbnailUrl"),
    status: formData.get("status"),
    categoryId: formData.get("categoryId"),
    tagIds: formData.getAll("tagIds"),
  });

  await prisma.post.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      thumbnailUrl: data.thumbnailUrl || null,
      status: data.status,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      authorId: session.user.id,
      categoryId: data.categoryId,
      postTags: {
        create: data.tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function updatePost(id: string, formData: FormData) {
  await requireAdmin();

  const data = PostSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    thumbnailUrl: formData.get("thumbnailUrl"),
    status: formData.get("status"),
    categoryId: formData.get("categoryId"),
    tagIds: formData.getAll("tagIds"),
  });

  const existing = await prisma.post.findUniqueOrThrow({ where: { id } });

  await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      thumbnailUrl: data.thumbnailUrl || null,
      status: data.status,
      publishedAt:
        data.status === "PUBLISHED" && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
      categoryId: data.categoryId,
      postTags: {
        deleteMany: {},
        create: data.tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/posts");
}

// ─── Category actions ────────────────────────────────────────────────────────

const CategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const rawSlug = (formData.get("slug") as string) || slugify(formData.get("name") as string);

  const data = CategorySchema.parse({
    name: formData.get("name"),
    slug: rawSlug,
    description: formData.get("description"),
  });

  await prisma.category.create({ data });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();

  const data = CategorySchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  });

  await prisma.category.update({ where: { id }, data });

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

// ─── Tag actions ─────────────────────────────────────────────────────────────

const TagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export async function createTag(formData: FormData) {
  await requireAdmin();

  const rawSlug = (formData.get("slug") as string) || slugify(formData.get("name") as string);

  const data = TagSchema.parse({
    name: formData.get("name"),
    slug: rawSlug,
  });

  await prisma.tag.create({ data });

  revalidatePath("/admin/tags");
  redirect("/admin/tags");
}

export async function updateTag(id: string, formData: FormData) {
  await requireAdmin();

  const data = TagSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  await prisma.tag.update({ where: { id }, data });

  revalidatePath("/admin/tags");
  redirect("/admin/tags");
}

export async function deleteTag(id: string) {
  await requireAdmin();
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/tags");
}
