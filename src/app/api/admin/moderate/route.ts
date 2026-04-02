import { isAdminSession } from "@/lib/admin-auth";
import { moderateSubmission } from "@/lib/service";
import { moderateSchema } from "@/lib/validations";
import { jsonError } from "@/lib/utils";

export async function POST(request: Request) {
  if (!isAdminSession()) {
    return jsonError("認証が必要です。", 401);
  }

  const payload = await request.json();
  const parsed = moderateSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors[0] ?? "入力内容を確認してください。", 422);
  }

  const record = await moderateSubmission(parsed.data.submissionId, parsed.data.decision, parsed.data.reason || "");

  if (!record) {
    return jsonError("対象投稿が見つかりません。", 404);
  }

  return Response.json({ submission: record });
}
