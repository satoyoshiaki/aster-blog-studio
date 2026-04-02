import { ReportButton } from "@/components/night-bottle/report-button";
import { Pagination } from "@/components/night-bottle/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { getApprovedHistory } from "@/lib/service";
import { formatDate, safeArray } from "@/lib/utils";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(Number(searchParams.page ?? "1") || 1, 1);
  const history = await getApprovedHistory(page, 12);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Approved History</p>
        <h1 className="text-4xl text-white">公開されたおすすめ履歴</h1>
        <p className="text-zinc-300">承認済み投稿を新着順で表示しています。サムネイルは年齢確認前はぼかされます。</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {history.items.map((item) => (
          <Card key={item.id} className="border-white/10 bg-zinc-950/80">
            <CardContent className="space-y-4 p-5">
              <div
                className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5"
                data-sensitive="true"
              >
                {item.thumbnail_url ? (
                  <img
                    alt={item.title}
                    className="aspect-[16/10] w-full object-cover"
                    src={item.thumbnail_url}
                  />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-zinc-900 text-sm text-zinc-500">
                    No Thumbnail
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="text-sm text-zinc-400">{formatDate(item.approved_at ?? item.created_at)}</p>
                <div className="flex flex-wrap gap-2">
                  {safeArray(item.tags).map((tag) => (
                    <span
                      key={`${item.id}-${tag}`}
                      className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <a
                  className="text-sm text-zinc-300 hover:text-white"
                  href={item.source_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  外部リンク
                </a>
                <ReportButton submissionId={item.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination page={history.page} pathname="/history" totalPages={history.totalPages} />
    </div>
  );
}
