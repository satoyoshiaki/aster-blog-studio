import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const publishedPostInclude = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  category: true,
  postTags: {
    include: {
      tag: true
    }
  }
} satisfies Prisma.PostInclude;

export async function getPublishedPosts() {
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED"
    },
    include: publishedPostInclude,
    orderBy: {
      publishedAt: "desc"
    }
  });
}

export async function getFeaturedPosts(limit = 3) {
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED"
    },
    include: publishedPostInclude,
    orderBy: {
      publishedAt: "desc"
    },
    take: limit
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: publishedPostInclude
  });
}

export async function getPostsByCategorySlug(slug: string) {
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      category: {
        slug
      }
    },
    include: publishedPostInclude,
    orderBy: {
      publishedAt: "desc"
    }
  });
}

export async function getPostsByTagSlug(slug: string) {
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      postTags: {
        some: {
          tag: {
            slug
          }
        }
      }
    },
    include: publishedPostInclude,
    orderBy: {
      publishedAt: "desc"
    }
  });
}

export async function searchPosts(query: string) {
  if (!query.trim()) {
    return [];
  }

  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        {
          category: {
            name: { contains: query, mode: "insensitive" }
          }
        },
        {
          postTags: {
            some: {
              tag: {
                name: { contains: query, mode: "insensitive" }
              }
            }
          }
        }
      ]
    },
    include: publishedPostInclude,
    orderBy: {
      publishedAt: "desc"
    }
  });
}

export async function getCategoriesWithCounts() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              status: "PUBLISHED"
            }
          }
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });
}

export async function getTagsWithCounts() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          postTags: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  return tags;
}
