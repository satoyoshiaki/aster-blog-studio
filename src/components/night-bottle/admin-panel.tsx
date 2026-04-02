"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, maskIpHash, safeArray } from "@/lib/utils";
import type { AllowedDomainRecord, BlockedKeywordRecord, ReportRecord, SubmissionRecord } from "@/types";

async function postJson(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "操作に失敗しました。");
  }
}

function SubmissionSection({
  title,
  items,
  onModerate,
}: {
  title: string;
  items: SubmissionRecord[];
  onModerate: (submissionId: string, decision: "approved" | "rejected") => Promise<void>;
}) {
  return (
    <Card className="border-white/10 bg-zinc-950/80">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? <p className="text-sm text-zinc-400">データはありません。</p> : null}
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="text-sm text-zinc-400">{item.source_url}</p>
                <p className="text-xs text-zinc-500">
                  {formatDate(item.created_at)} / {maskIpHash(item.submitter_ip_hash)}
                </p>
                {item.description ? <p className="text-sm text-zinc-300">{item.description}</p> : null}
                <div className="flex flex-wrap gap-2">
                  {safeArray(item.tags).map((tag) => (
                    <span
                      key={`${item.id}-${tag}`}
                      className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => void onModerate(item.id, "approved")}>承認</Button>
                <Button variant="destructive" onClick={() => void onModerate(item.id, "rejected")}>
                  却下
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AdminPanel({
  submissions,
  reports,
  domains,
  keywords,
}: {
  submissions: SubmissionRecord[];
  reports: ReportRecord[];
  domains: AllowedDomainRecord[];
  keywords: BlockedKeywordRecord[];
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [domain, setDomain] = useState("");
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState("");

  const mutate = async (task: () => Promise<void>) => {
    setError("");
    try {
      await task();
      router.refresh();
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : "操作に失敗しました。");
    }
  };

  return (
    <div className="space-y-8">
      {error ? <p className="rounded-2xl bg-rose-500/10 p-4 text-sm text-rose-200">{error}</p> : null}
      <div className="grid gap-8 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-8">
          <SubmissionSection
            items={submissions.filter((item) => item.status === "pending")}
            title="Pending"
            onModerate={async (submissionId, decision) =>
              mutate(() => postJson("/api/admin/moderate", { submissionId, decision, reason }))
            }
          />
          <SubmissionSection
            items={submissions.filter((item) => item.status === "approved")}
            title="Approved"
            onModerate={async (submissionId, decision) =>
              mutate(() => postJson("/api/admin/moderate", { submissionId, decision, reason }))
            }
          />
          <SubmissionSection
            items={submissions.filter((item) => item.status === "rejected")}
            title="Rejected"
            onModerate={async (submissionId, decision) =>
              mutate(() => postJson("/api/admin/moderate", { submissionId, decision, reason }))
            }
          />
        </div>

        <div className="space-y-8">
          <Card className="border-white/10 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>モデレーション理由</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="却下理由やメモを入力"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>ドメイン許可リスト</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input placeholder="example.com" value={domain} onChange={(event) => setDomain(event.target.value)} />
                <Button
                  onClick={() =>
                    void mutate(async () => {
                      await postJson("/api/admin/domains", { action: "add", domain });
                      setDomain("");
                    })
                  }
                >
                  追加
                </Button>
              </div>
              <div className="space-y-2">
                {domains.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-3 text-sm">
                    <span>{item.domain}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void mutate(() => postJson("/api/admin/domains", { action: "remove", domain: item.domain }))}
                    >
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>NGワード管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input placeholder="禁止語句" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
                <Button
                  onClick={() =>
                    void mutate(async () => {
                      await postJson("/api/admin/keywords", { action: "add", keyword });
                      setKeyword("");
                    })
                  }
                >
                  追加
                </Button>
              </div>
              <div className="space-y-2">
                {keywords.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/5 p-3 text-sm">
                    <span>{item.keyword}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void mutate(() => postJson("/api/admin/keywords", { action: "remove", keyword: item.keyword }))
                      }
                    >
                      削除
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-zinc-950/80">
            <CardHeader>
              <CardTitle>通報一覧</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports.length === 0 ? <p className="text-sm text-zinc-400">通報はまだありません。</p> : null}
              {reports.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                  <p className="font-medium text-white">{item.reason}</p>
                  <p className="mt-1 text-zinc-300">{item.details ?? "詳細なし"}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {formatDate(item.created_at)} / {maskIpHash(item.reporter_ip_hash)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
