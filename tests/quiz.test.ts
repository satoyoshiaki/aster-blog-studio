import assert from "node:assert/strict";
import test from "node:test";

import type { AnswerValue } from "@/lib/scoring";
import { calculateQuizResult, getReliabilityTier } from "@/lib/scoring";
import {
  detectPreferredLocale,
  getLocaleFromSearchParam,
  isSupportedLocale,
} from "@/lib/quiz-locale";

const createAnswerMap = (value: AnswerValue) =>
  Object.fromEntries(
    Array.from({ length: 88 }, (_, index) => [`q-${String(index + 1).padStart(3, "0")}`, value]),
  );

const createConsistentAnswerMap = async (positive: AnswerValue, reverse: AnswerValue) => {
  const { default: questions } = await import("../data/questions.json");

  return Object.fromEntries(
    questions.map((question) => [
      question.id,
      question.direction === "positive" ? positive : reverse,
    ]),
  ) as Record<string, AnswerValue>;
};

test("calculateQuizResult returns a strong ESTJ leaning for axis-first matching answers", async () => {
  const { default: questions } = await import("../data/questions.json");

  const result = calculateQuizResult(
    questions,
    await createConsistentAnswerMap("stronglyAgree", "stronglyDisagree"),
  );

  assert.equal(result.type, "ESTJ");
  assert.equal(result.axisScores.EI.letter, "E");
  assert.equal(result.axisScores.SN.letter, "S");
  assert.equal(result.axisScores.TF.letter, "T");
  assert.equal(result.axisScores.JP.letter, "J");
  assert.ok(result.reliability.score >= 85);
});

test("calculateQuizResult flips letters when reverse-coded answers dominate", async () => {
  const { default: questions } = await import("../data/questions.json");

  const result = calculateQuizResult(
    questions,
    await createConsistentAnswerMap("stronglyDisagree", "stronglyAgree"),
  );

  assert.equal(result.type, "INFP");
  assert.equal(result.axisScores.EI.letter, "I");
  assert.equal(result.axisScores.SN.letter, "N");
  assert.equal(result.axisScores.TF.letter, "F");
  assert.equal(result.axisScores.JP.letter, "P");
});

test("reliability drops when paired questions are answered inconsistently", async () => {
  const { default: questions } = await import("../data/questions.json");

  const answers = Object.fromEntries(
    questions.map((question) => [
      question.id,
      question.direction === "positive" ? "stronglyAgree" : "stronglyAgree",
    ]),
  ) as Record<string, AnswerValue>;

  const result = calculateQuizResult(questions, answers);

  assert.ok(result.reliability.score <= 40);
  assert.equal(getReliabilityTier(result.reliability.score), "low");
});

test("locale helpers honor url params, saved locale, and browser language in order", () => {
  assert.equal(getLocaleFromSearchParam("ko"), "ko");
  assert.equal(getLocaleFromSearchParam("fr"), null);
  assert.equal(isSupportedLocale("zh-CN"), true);
  assert.equal(isSupportedLocale("zh-TW"), false);

  assert.equal(
    detectPreferredLocale({
      searchParam: "en",
      storedLocale: "ja",
      browserLanguage: "ko-KR",
      fallback: "ja",
    }),
    "en",
  );

  assert.equal(
    detectPreferredLocale({
      searchParam: null,
      storedLocale: "zh-CN",
      browserLanguage: "ko-KR",
      fallback: "ja",
    }),
    "zh-CN",
  );

  assert.equal(
    detectPreferredLocale({
      searchParam: null,
      storedLocale: null,
      browserLanguage: "ko-KR",
      fallback: "ja",
    }),
    "ko",
  );

  assert.equal(
    detectPreferredLocale({
      searchParam: null,
      storedLocale: null,
      browserLanguage: "fr-FR",
      fallback: "en",
    }),
    "en",
  );
});
