import { cookies } from "next/headers";

import { createAdminSessionValue, getAdminSessionCookieName } from "@/lib/admin-auth";
import { env } from "@/lib/env";
import { assertCsrfToken, assertSameOrigin } from "@/lib/security";
import { adminLoginSchema } from "@/lib/validations";
import { jsonError } from "@/lib/utils";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return jsonError("不正なオリジンです。", 403);
  }

  const payload = await request.json();
  const parsed = adminLoginSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors[0] ?? "入力内容を確認してください。", 422);
  }

  if (!assertCsrfToken(parsed.data.csrfToken)) {
    return jsonError("CSRF 検証に失敗しました。", 403);
  }

  if (!env.adminPassword || parsed.data.password !== env.adminPassword) {
    return jsonError("認証に失敗しました。", 401);
  }

  cookies().set(getAdminSessionCookieName(), createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return Response.json({ ok: true });
}
