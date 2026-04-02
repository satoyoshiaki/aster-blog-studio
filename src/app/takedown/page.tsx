"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCsrfToken } from "@/components/night-bottle/csrf-token-field";

export default function TakedownPage() {
  const csrfToken = useCsrfToken();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Card className="border-white/10 bg-zinc-950/80">
        <CardHeader>
          <CardTitle className="text-4xl">削除依頼</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setMessage("");

              const formData = new FormData(event.currentTarget);
              const details = [
                `対象URL: ${String(formData.get("targetUrl") ?? "")}`,
                `連絡先: ${String(formData.get("contact") ?? "")}`,
                `理由: ${String(formData.get("details") ?? "")}`,
              ].join("\n");

              try {
                const response = await fetch("/api/report", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    reason: "takedown_request",
                    details,
                    honeypot: "",
                    csrfToken,
                  }),
                });
                const data = (await response.json()) as { error?: string };

                if (!response.ok) {
                  throw new Error(data.error ?? "送信に失敗しました。");
                }

                event.currentTarget.reset();
                setMessage("削除依頼を受け付けました。内容を確認のうえ対応します。");
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "送信に失敗しました。");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="targetUrl">対象 URL</Label>
              <Input id="targetUrl" name="targetUrl" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">連絡先</Label>
              <Input id="contact" name="contact" placeholder="メールアドレスまたは連絡手段" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">依頼内容</Label>
              <Textarea id="details" name="details" required />
            </div>
            <Button disabled={loading} type="submit">
              送信
            </Button>
            {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
