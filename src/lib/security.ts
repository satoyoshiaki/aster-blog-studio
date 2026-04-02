import crypto from "crypto";
import { cookies, headers } from "next/headers";

import { CSRF_COOKIE_NAME } from "@/lib/constants";
import { env } from "@/lib/env";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function createCsrfToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function getRequestIp() {
  const headerList = headers();
  const forwarded = headerList.get("x-forwarded-for");
  const realIp = headerList.get("x-real-ip");

  return forwarded?.split(",")[0]?.trim() ?? realIp ?? "127.0.0.1";
}

export function hashIp(ip: string) {
  return crypto.createHash("sha256").update(`${ip}:${env.ipHashSalt}`).digest("hex");
}

export function getIpHashFromRequest() {
  return hashIp(getRequestIp());
}

export function getCsrfTokenFromCookie() {
  return cookies().get(CSRF_COOKIE_NAME)?.value ?? "";
}

export function assertCsrfToken(token: string | undefined) {
  return Boolean(token && token === getCsrfTokenFromCookie());
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).origin === new URL(env.appUrl).origin;
  } catch {
    return false;
  }
}

export function checkRateLimit(key: string) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + env.rateLimitWindowMs,
    });
    return { allowed: true, remaining: env.rateLimitMaxRequests - 1 };
  }

  if (current.count >= env.rateLimitMaxRequests) {
    return { allowed: false, remaining: 0 };
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  return { allowed: true, remaining: env.rateLimitMaxRequests - current.count };
}

export function normalizeUrl(input: string) {
  const url = new URL(input.trim());

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("URL は http / https のみ対応です。");
  }

  url.hash = "";

  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.slice(4);
  }

  return url.toString();
}

export function containsBlockedKeyword(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.find((keyword) => normalized.includes(keyword.toLowerCase())) ?? null;
}
