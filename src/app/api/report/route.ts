import { reportSchema } from "@/lib/validations";
import { assertCsrfToken, assertSameOrigin, checkRateLimit, getIpHashFromRequest } from "@/lib/security";
import { submitReport } from "@/lib/service";
import { jsonError } from "@/lib/utils";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return jsonError("不正なオリジンです。", 403);
  }

  const payload = await request.json();
  const parsed = reportSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors[0] ?? "入力内容を確認してください。", 422);
  }

  if (!assertCsrfToken(parsed.data.csrfToken)) {
    return jsonError("CSRF 検証に失敗しました。", 403);
  }

  if (parsed.data.honeypot) {
    return jsonError("Bot submission blocked.", 400);
  }

  const ipHash = getIpHashFromRequest();
  const rate = checkRateLimit(`report:${ipHash}`);

  if (!rate.allowed) {
    return jsonError("通報回数が多すぎます。", 429);
  }

  try {
    const report = await submitReport(parsed.data, ipHash);
    return Response.json({ id: report.id }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "通報に失敗しました。", 500);
  }
}
