"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STORAGE_KEY = "nb_age_confirmed";

function unlockBody() {
  document.body.dataset.ageGate = "unlocked";
}

function lockBody() {
  document.body.dataset.ageGate = "locked";
}

export function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const confirmed = window.localStorage.getItem(STORAGE_KEY) === "true";

    if (confirmed) {
      unlockBody();
      setOpen(false);
      return;
    }

    lockBody();
    setOpen(true);
  }, []);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-white/10 bg-zinc-950/95">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Age Gate</p>
          <CardTitle className="mt-2 text-3xl">18歳以上向けの匿名交換です</CardTitle>
          <CardDescription className="mt-3 leading-6">
            Night Bottle は成人向け作品のおすすめ交換サービスです。18歳未満の方は利用できません。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
            表示を続けると、利用規約とプライバシーポリシーに同意したものとみなします。
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="w-full bg-violet-600 hover:bg-violet-500"
              onClick={() => {
                window.localStorage.setItem(STORAGE_KEY, "true");
                unlockBody();
                setOpen(false);
              }}
            >
              18歳以上として入場
            </Button>
            <Button asChild className="w-full" variant="outline">
              <a href="https://www.google.com">退出する</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
