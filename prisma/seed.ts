import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password,
      role: "ADMIN",
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: "general" },
    update: {},
    create: {
      name: "General",
      slug: "general",
      description: "General topics and updates.",
    },
  });

  const tag = await prisma.tag.upsert({
    where: { slug: "welcome" },
    update: {},
    create: { name: "Welcome", slug: "welcome" },
  });

  await prisma.post.upsert({
    where: { slug: "hello-world" },
    update: {},
    create: {
      title: "Hello, World!",
      slug: "hello-world",
      excerpt: "Welcome to Aster Blog Studio — your new editorial home.",
      content:
        "This is your first post. Edit or delete it, then start writing!\n\nAster Blog Studio is a premium editorial platform built for personal publishers and lean media teams. Write, publish, and grow your audience with a clean, distraction-free interface.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      authorId: admin.id,
      categoryId: category.id,
      postTags: { create: [{ tagId: tag.id }] },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
