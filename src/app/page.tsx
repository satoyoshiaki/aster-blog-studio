import Link from "next/link";

import { SubmitForm } from "@/components/night-bottle/submit-form";
import { Card, CardContent } from "@/components/ui/card";
import { buildHomepageData } from "@/lib/service";
import { formatDate, safeArray } from "@/lib/utils";

export default async function HomePage() {
  const { domains, history } = await buildHomepageData();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-violet-200">
            Anonymous Adult Recs
          </div>
          <h1 className="max-w-3xl text-5xl leading-none text-white sm:text-6xl">
            夜のおすすめを、匿名のボトルで回す。
          </h1>
          <p className="max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
            投稿は匿名のまま審査待ちとして受け付けられ、承認後に Night Bottle の公開プールへ追加されます。
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-5">
                <p className="text-3xl font-semibold text-white">{domains.length}</p>
                <p className="mt-2 text-sm text-zinc-400">許可済み公式ドメイン</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-5">
                <p className="text-3xl font-semibold text-white">{history.length}</p>
                <p className="mt-2 text-sm text-zinc-400">最近の交換ログ</p>
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-5">
                <p className="text-3xl font-semibold text-white">18+</p>
                <p className="mt-2 text-sm text-zinc-400">年齢確認必須</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-500/15 via-transparent to-fuchsia-500/10 p-6">
          <div className="rounded-[28px] border border-white/10 bg-black/60 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Allowed Sources</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {domains.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100"
                >
                  {item.domain}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm leading-7 text-zinc-300">
              公式販売・公式配信の URL のみ受け付けます。コメントは任意、タグも任意です。
            </p>
          </div>
        </div>
      </section>

      <SubmitForm />

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Recent Bottles</p>
            <h2 className="mt-2 text-3xl text-white">最近交換されたおすすめ</h2>
          </div>
          <Link className="text-sm text-zinc-300 hover:text-white" href="/history">
            すべて見る
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {history.map((item) => (
            <Card key={item.id} className="border-white/10 bg-zinc-950/80">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-zinc-500">{formatDate(item.created_at)}</p>
                <p className="text-lg font-semibold text-white">
                  {item.received?.title ?? "まだ交換相手が見つかっていません"}
                </p>
                <p className="line-clamp-3 text-sm text-zinc-300">
                  {item.received?.description ?? "新規投稿直後など、返却先がまだない場合があります。"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {safeArray(item.received?.tags).map((tag) => (
                    <span
                      key={`${item.id}-${tag}`}
                      className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
