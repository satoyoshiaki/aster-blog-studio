import { getApprovedHistory } from "@/lib/service";
import { jsonError } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get("page") ?? "1") || 1, 1);
  const pageSize = Math.max(Number(searchParams.get("pageSize") ?? "12") || 12, 1);

  try {
    const result = await getApprovedHistory(page, pageSize);
    return Response.json(result);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "履歴取得に失敗しました。", 500);
  }
}
