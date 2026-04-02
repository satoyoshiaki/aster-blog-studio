"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useForm } from "@/vendor/react-hook-form";
import { zodResolver } from "@/vendor/hookform-zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCsrfToken } from "@/components/night-bottle/csrf-token-field";
import { submitSchema, type SubmitInput } from "@/lib/validations";

type SubmitFormValues = Omit<SubmitInput, "ageConfirmed" | "acceptPolicy"> & {
  ageConfirmed: boolean;
  acceptPolicy: boolean;
};

export function SubmitForm() {
  const router = useRouter();
  const csrfToken = useCsrfToken();
  const [serverMessage, setServerMessage] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SubmitFormValues>({
    defaultValues: {
      url: "",
      title: "",
      note: "",
      tags: "",
      ageConfirmed: false,
      acceptPolicy: false,
      honeypot: "",
      csrfToken: "",
    },
    resolver: zodResolver(submitSchema) as never,
  });

  useEffect(() => {
    setValue("csrfToken", csrfToken);
  }, [csrfToken]);

  return (
    <Card className="border-white/10 bg-zinc-950/80 shadow-soft">
      <CardHeader>
        <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Drop A Bottle</p>
        <CardTitle className="mt-2 text-3xl sm:text-4xl">匿名で1本送り、誰かの1本を受け取る</CardTitle>
        <CardDescription className="mt-3 max-w-2xl leading-7">
          公式販売ページの URL を送ると審査待ちとして受け付けます。コメントとタグは任意です。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={handleSubmit(async (values) => {
            setServerMessage("");
            const response = await fetch("/api/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...values, csrfToken }),
            });
            const data = (await response.json()) as {
              error?: string;
              exchangeId?: string;
              reason?: string | null;
            };

            if (!response.ok) {
              setServerMessage(data.error ?? "送信に失敗しました。");
              return;
            }

            if (data.exchangeId) {
              router.push(`/exchange/${data.exchangeId}`);
              router.refresh();
              return;
            }

            setServerMessage(data.reason ?? "受付を完了しました。");
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="url">作品 URL</Label>
            <Input
              id="url"
              placeholder="https://www.dmm.co.jp/..."
              {...register("url")}
            />
            {errors.url ? <p className="text-sm text-rose-300">{errors.url.message}</p> : null}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル補助</Label>
              <Input id="title" placeholder="任意。自動取得に失敗した時の補助" {...register("title")} />
              {errors.title ? <p className="text-sm text-rose-300">{errors.title.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">タグ</Label>
              <Input id="tags" placeholder="ドラマ, 余韻, ソフト" {...register("tags")} />
              {errors.tags ? <p className="text-sm text-rose-300">{errors.tags.message}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">コメント</Label>
            <Textarea
              id="note"
              placeholder="匿名で次の誰かに渡したいメモ"
              {...register("note")}
            />
            {errors.note ? <p className="text-sm text-rose-300">{errors.note.message}</p> : null}
          </div>

          <input
            aria-hidden="true"
            autoComplete="off"
            className="hidden"
            tabIndex={-1}
            {...register("honeypot")}
          />
          <input type="hidden" {...register("csrfToken")} />

          <label className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
            <input className="mt-1" type="checkbox" {...register("ageConfirmed")} />
            <span>私は18歳以上であり、成人向け作品の共有であることを理解しています。</span>
          </label>
          {errors.ageConfirmed ? (
            <p className="text-sm text-rose-300">{errors.ageConfirmed.message}</p>
          ) : null}

          <label className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
            <input className="mt-1" type="checkbox" {...register("acceptPolicy")} />
            <span>
              <Link className="text-violet-300 underline-offset-4 hover:underline" href="/terms">
                利用規約
              </Link>
              {" / "}
              <Link className="text-violet-300 underline-offset-4 hover:underline" href="/privacy">
                プライバシーポリシー
              </Link>
              に同意します。
            </span>
          </label>
          {errors.acceptPolicy ? (
            <p className="text-sm text-rose-300">{errors.acceptPolicy.message}</p>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button
              className="bg-violet-600 px-8 py-6 text-base hover:bg-violet-500"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "送信中..." : "おすすめを流す"}
            </Button>
            <p className="text-sm text-zinc-400">投稿は自動チェック後に審査待ちとなり、管理者承認後に公開候補へ追加されます。</p>
          </div>

          {serverMessage ? <p className="text-sm text-zinc-200">{serverMessage}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
