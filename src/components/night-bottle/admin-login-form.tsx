"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useForm } from "@/vendor/react-hook-form";
import { zodResolver } from "@/vendor/hookform-zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCsrfToken } from "@/components/night-bottle/csrf-token-field";
import { adminLoginSchema, type AdminLoginInput } from "@/lib/validations";

export function AdminLoginForm() {
  const router = useRouter();
  const csrfToken = useCsrfToken();
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginInput>({
    defaultValues: {
      password: "",
      csrfToken: "",
    },
    resolver: zodResolver(adminLoginSchema),
  });

  useEffect(() => {
    setValue("csrfToken", csrfToken);
  }, [csrfToken]);

  return (
    <Card className="mx-auto max-w-md border-white/10 bg-zinc-950/80">
      <CardHeader>
        <CardTitle className="text-3xl">Night Bottle Admin</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            setMessage("");
            const response = await fetch("/api/admin/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...values, csrfToken }),
            });
            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
              setMessage(data.error ?? "認証に失敗しました。");
              return;
            }

            router.refresh();
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="password">管理パスワード</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password ? (
              <p className="text-sm text-rose-300">{errors.password.message}</p>
            ) : null}
          </div>
          <input type="hidden" {...register("csrfToken")} />
          <Button className="w-full" disabled={isSubmitting} type="submit">
            ログイン
          </Button>
          {message ? <p className="text-sm text-rose-300">{message}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
