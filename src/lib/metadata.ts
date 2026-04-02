import { truncate } from "@/lib/utils";

type MetadataResult = {
  title: string;
  domain: string;
  thumbnailUrl: string | null;
  sourceLabel: string;
};

function titleFromPath(pathname: string) {
  const last = pathname.split("/").filter(Boolean).pop();

  if (!last) {
    return "匿名のおすすめ作品";
  }

  return decodeURIComponent(last)
    .replace(/[-_]+/g, " ")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchUrlMetadata(urlValue: string, inputTitle?: string) {
  const url = new URL(urlValue);
  const fallbackTitle = truncate(inputTitle?.trim() || titleFromPath(url.pathname) || url.hostname, 80);
  const metadata: MetadataResult = {
    title: fallbackTitle,
    domain: url.hostname,
    thumbnailUrl: null,
    sourceLabel: url.hostname.replace(/\.(com|jp|net|tv)$/i, ""),
  };

  try {
    const response = await fetch(urlValue, {
      headers: {
        "user-agent": "NightBottleBot/1.0 (+https://night-bottle.local)",
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      return metadata;
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const imageMatch =
      html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ??
      html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);

    if (titleMatch?.[1]) {
      metadata.title = truncate(titleMatch[1].replace(/\s+/g, " ").trim(), 80);
    }

    if (imageMatch?.[1]) {
      metadata.thumbnailUrl = imageMatch[1];
    }
  } catch {
    return metadata;
  }

  return metadata;
}
