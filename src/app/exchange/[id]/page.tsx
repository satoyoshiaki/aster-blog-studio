import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyButton } from "@/components/night-bottle/copy-button";
import { ReportButton } from "@/components/night-bottle/report-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExchange } from "@/lib/service";
import { formatDate, safeArray } from "@/lib/utils";

export default async function ExchangePage({ params }: { params: { id: string } }) {
  const exchange = await getExchange(params.id);

  if (!exchange) {
    notFound();
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/exchange/${exchange.id}`;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Exchange Result</p>
        <h1 className="text-4xl text-white">匿名ボトルの交換結果</h1>
        <p className="text-zinc-300">{formatDate(exchange.created_at)} に交換されました。</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-zinc-950/80">
          <CardHeader>
            <CardTitle>あなたが送った作品</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold text-white">{exchange.submitted?.title}</p>
            <p className="text-sm text-zinc-400">{exchange.submitted?.source_domain}</p>
            <p className="text-sm leading-7 text-zinc-300">{exchange.submitted?.description ?? "コメントなし"}</p>
            <div className="flex flex-wrap gap-2">
              {safeArray(exchange.submitted?.tags).map((tag) => (
                <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-200">
                  #{tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-400/20 bg-gradient-to-br from-violet-500/15 via-zinc-950 to-zinc-950">
          <CardHeader>
            <CardTitle>あなたが受け取った作品</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exchange.received ? (
              <>
                <div
                  className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5"
                  data-sensitive="true"
                >
                  {exchange.received.thumbnail_url ? (
                    <img
                      alt={exchange.received.title}
                      className="aspect-[16/10] w-full object-cover"
                      src={exchange.received.thumbnail_url}
                    />
                  ) : (
                    <div className="flex aspect-[16/10] items-center justify-center bg-zinc-900 text-sm text-zinc-500">
                      サムネイルなし
                    </div>
                  )}
                </div>
                <p className="text-2xl font-semibold text-white">{exchange.received.title}</p>
                <p className="text-sm leading-7 text-zinc-300">{exchange.received.description ?? "コメントなし"}</p>
                <div className="flex flex-wrap gap-2">
                  {safeArray(exchange.received.tags).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <Button asChild className="bg-violet-600 hover:bg-violet-500">
                  <a href={exchange.received.source_url} rel="noreferrer" target="_blank">
                    外部リンクを開く
                  </a>
                </Button>
              </>
            ) : (
              <p className="text-zinc-300">まだ返却先が見つかっていません。少し時間をおいて再度確認してください。</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-300">この結果ページは共有できます。</p>
          <p className="text-xs text-zinc-500">{shareUrl}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <CopyButton text={shareUrl} />
          <Button asChild>
            <Link href="/">もう1本送る</Link>
          </Button>
        </div>
      </div>

      <ReportButton exchangeId={exchange.id} submissionId={exchange.received?.id} />
    </div>
  );
}
