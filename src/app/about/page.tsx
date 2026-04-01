import type { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: "Learn more about Aster Blog Studio.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-20">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold mb-8">
          About
        </h1>
        <div className="space-y-4 text-[hsl(var(--muted-foreground))] leading-relaxed">
          <p>
            Aster Blog Studio is a premium editorial platform built for personal
            publishers and lean media teams.
          </p>
          <p>
            Write, publish, and grow your audience with a clean,
            distraction-free interface powered by modern web technologies.
          </p>
          <p>
            Built with Next.js, Prisma, and Tailwind CSS — fast, typesafe, and
            fully self-hostable.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
