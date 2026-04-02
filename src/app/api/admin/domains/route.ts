import { isAdminSession } from "@/lib/admin-auth";
import { mutateDomain } from "@/lib/service";
import { domainSchema } from "@/lib/validations";
import { listAllowedDomains } from "@/lib/repository";
import { jsonError } from "@/lib/utils";

export async function GET() {
  if (!isAdminSession()) {
    return jsonError("認証が必要です。", 401);
  }

  return Response.json({ domains: await listAllowedDomains() });
}

export async function POST(request: Request) {
  if (!isAdminSession()) {
    return jsonError("認証が必要です。", 401);
  }

  const payload = await request.json();
  const parsed = domainSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors[0] ?? "入力内容を確認してください。", 422);
  }

  await mutateDomain(parsed.data.action, parsed.data.domain);
  return Response.json({ ok: true });
}
