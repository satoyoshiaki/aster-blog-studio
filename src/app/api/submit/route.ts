import { submitSchema } from "@/lib/validations";
import { assertCsrfToken, assertSameOrigin, checkRateLimit, getIpHashFromRequest } from "@/lib/security";
import { submitBottle } from "@/lib/service";
import { jsonError } from "@/lib/utils";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return jsonError("不正なオリジンです。", 403);
  }

  const payload = await request.json();
  const parsed = submitSchema.safeParse(payload);

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
  const rate = checkRateLimit(`submit:${ipHash}`);

  if (!rate.allowed) {
    return jsonError("送信回数が多すぎます。しばらく待ってから再試行してください。", 429);
  }

  try {
    const result = await submitBottle(parsed.data, ipHash);

    return Response.json(
      {
        exchangeId: result.exchange?.id ?? null,
        reason: result.reason,
        rejected: Boolean(result.rejected),
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "送信に失敗しました。", 400);
  }
}
