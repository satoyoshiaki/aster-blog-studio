import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/utils";

export const siteConfig = {
  name: "Aster Blog Studio",
  description:
    "A premium editorial platform for personal publishers and lean media teams.",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000"
};

export function buildMetadata({
  title,
  description,
  path = "/"
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const url = absoluteUrl(path);

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description
    },
    alternates: {
      canonical: url
    }
  };
}
