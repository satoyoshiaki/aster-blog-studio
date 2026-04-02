"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCsrfToken } from "@/components/night-bottle/csrf-token-field";

const reasons = ["スパム", "違法性の疑い", "不正確な情報", "権利侵害の疑い", "その他"];

export function ReportButton({
  exchangeId,
  submissionId,
}: {
  exchangeId?: string;
  submissionId?: string;
}) {
  const csrfToken = useCsrfToken();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(reasons[0]);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-3">
      <Button type="button" variant="ghost" onClick={() => setOpen((value) => !value)}>
        通報
      </Button>
      {open ? (
        <form
          className="space-y-3 rounded-3xl border border-white/10 bg-zinc-900/80 p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setMessage("");

            try {
              const response = await fetch("/api/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  exchangeId,
                  submissionId,
                  reason,
                  details,
                  honeypot: "",
                  csrfToken,
                }),
              });
              const data = (await response.json()) as { error?: string };

              if (!response.ok) {
                throw new Error(data.error ?? "通報に失敗しました。");
              }

              setMessage("通報を受け付けました。");
              setDetails("");
              setOpen(false);
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "通報に失敗しました。");
            } finally {
              setLoading(false);
            }
          }}
        >
          <Input
            aria-label="通報理由"
            list="report-reasons"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <datalist id="report-reasons">
            {reasons.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <Textarea
            placeholder="補足があれば入力してください"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />
          <div className="flex items-center gap-3">
            <Button disabled={loading} type="submit">
              送信
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              閉じる
            </Button>
          </div>
        </form>
      ) : null}
      {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
    </div>
  );
}
