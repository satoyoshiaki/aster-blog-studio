import type { Category, Post, PostStatus, Tag, UserRole } from "@prisma/client";

export type PostWithRelations = Post & {
  author: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  category: Category;
  postTags: Array<{
    tag: Tag;
  }>;
};

export type PostFormState = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnailUrl: string;
  status: PostStatus;
  categoryId: string;
  tagIds: string[];
};
