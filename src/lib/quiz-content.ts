import resultComments from "../../data/result-comments.json";
import questions from "../../data/questions.json";
import en from "../../messages/en.json";
import ja from "../../messages/ja.json";
import ko from "../../messages/ko.json";
import zhCN from "../../messages/zh-CN.json";
import type { ResultCommentRecord, SupportedLocale } from "@/lib/quiz-types";

export const quizQuestions = questions as import("@/lib/quiz-types").Question[];

export const resultCommentMap = resultComments as ResultCommentRecord;

export const messages = {
  ja,
  en,
  ko,
  "zh-CN": zhCN,
} as const satisfies Record<SupportedLocale, typeof en>;
