import { isAdminSession } from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/service";
import { jsonError } from "@/lib/utils";

export async function GET() {
  if (!isAdminSession()) {
    return jsonError("認証が必要です。", 401);
  }

  const { submissions } = await getAdminDashboardData();
  return Response.json({ submissions });
}
