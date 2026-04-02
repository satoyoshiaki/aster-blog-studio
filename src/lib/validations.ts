import { z } from "zod";

import { normalizeDomain } from "@/lib/domain";

export const submitSchema = z.object({
  url: z.string().url("作品 URL を入力してください。"),
  title: z.string().max(120, "タイトルは120文字以内で入力してください。").optional().or(z.literal("")),
  note: z.string().max(500, "メモは500文字以内で入力してください。").optional().or(z.literal("")),
  tags: z.string().max(120, "タグは120文字以内で入力してください。").optional().or(z.literal("")),
  ageConfirmed: z.literal(true, {
    errorMap: () => ({ message: "18歳以上のみ利用できます。" }),
  }),
  acceptPolicy: z.literal(true, {
    errorMap: () => ({ message: "利用規約とポリシーへの同意が必要です。" }),
  }),
  honeypot: z.string().max(0).optional().default(""),
  csrfToken: z.string().min(1, "CSRF token is missing."),
});

export const reportSchema = z.object({
  exchangeId: z.string().optional(),
  submissionId: z.string().optional(),
  reason: z.string().min(1, "理由を選択してください。").max(120),
  details: z.string().max(500).optional().or(z.literal("")),
  honeypot: z.string().max(0).optional().default(""),
  csrfToken: z.string().min(1),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "管理パスワードを入力してください。"),
  csrfToken: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください。"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください。"),
});

export const moderateSchema = z.object({
  submissionId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().max(240).optional().or(z.literal("")),
});

export const domainSchema = z.object({
  action: z.enum(["add", "remove"]),
  domain: z
    .string()
    .min(1)
    .max(120)
    .transform((value, ctx) => {
      try {
        return normalizeDomain(value);
      } catch (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error instanceof Error ? error.message : "有効なドメインを入力してください。",
        });
        return z.NEVER;
      }
    }),
});

export const keywordSchema = z.object({
  action: z.enum(["add", "remove"]),
  keyword: z.string().min(1).max(120),
});

export type SubmitInput = z.infer<typeof submitSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
