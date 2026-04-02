import { isAdminSession } from "@/lib/admin-auth";
import { listBlockedKeywords } from "@/lib/repository";
import { mutateKeyword } from "@/lib/service";
import { jsonError } from "@/lib/utils";
import { keywordSchema } from "@/lib/validations";

export async function GET() {
  if (!isAdminSession()) {
    return jsonError("認証が必要です。", 401);
  }

  return Response.json({ keywords: await listBlockedKeywords() });
}

export async function POST(request: Request) {
  if (!isAdminSession()) {
    return jsonError("認証が必要です。", 401);
  }

  const payload = await request.json();
  const parsed = keywordSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors[0] ?? "入力内容を確認してください。", 422);
  }

  await mutateKeyword(parsed.data.action, parsed.data.keyword);
  return Response.json({ ok: true });
}
