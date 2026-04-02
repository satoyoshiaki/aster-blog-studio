"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Copy, Globe2, MoonStar, RotateCcw, Share2, Sparkles, SunMedium } from "lucide-react";

import { AxisBarChart } from "@/components/axis-bar-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { messages, quizQuestions, resultCommentMap } from "@/lib/quiz-content";
import { detectPreferredLocale, getLocaleFromSearchParam } from "@/lib/quiz-locale";
import { getTypeProfile } from "@/lib/personality-profiles";
import { likertOptions, type AnswerValue, calculateQuizResult } from "@/lib/scoring";
import type { SupportedLocale } from "@/lib/quiz-types";
import { cn } from "@/lib/utils";

const QUIZ_STATE_KEY = "mirror16.quiz-state";
const LOCALE_KEY = "mirror16.locale";
const THEME_KEY = "mirror16.theme";
const localeOptions = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
  { value: "zh-CN", label: "简体中文" },
] as const;
const axisOrder = ["EI", "SN", "TF", "JP"] as const;

type ThemeMode = "light" | "dark" | "system";

type QuizAppProps = {
  initialLocaleParam?: string | null;
};

type Screen = "loading" | "intro" | "quiz" | "result";
type ResultSection = [string, string[]];

function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

function resolveTheme(mode: ThemeMode) {
  if (mode !== "system") {
    return mode;
  }

  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readSavedQuizState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(QUIZ_STATE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      answers?: Record<string, AnswerValue>;
      currentIndex?: number;
    };

    const safeAnswers =
      parsed.answers && typeof parsed.answers === "object"
        ? Object.fromEntries(
            Object.entries(parsed.answers).filter((entry): entry is [string, AnswerValue] =>
              likertOptions.includes(entry[1] as AnswerValue),
            ),
          )
        : {};

    return {
      answers: safeAnswers,
      currentIndex:
        typeof parsed.currentIndex === "number" && parsed.currentIndex >= 0
          ? Math.min(parsed.currentIndex, quizQuestions.length - 1)
          : 0,
    };
  } catch {
    window.localStorage.removeItem(QUIZ_STATE_KEY);
    return null;
  }
}

export function QuizApp({ initialLocaleParam }: QuizAppProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [screen, setScreen] = useState<Screen>("loading");
  const [locale, setLocale] = useState<SupportedLocale>("ja");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_KEY);
    const storedTheme = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const paramLocale = getLocaleFromSearchParam(initialLocaleParam ?? searchParams.get("lang"));
    const resolvedLocale = detectPreferredLocale({
      searchParam: paramLocale,
      storedLocale,
      browserLanguage: navigator.language,
      fallback: "ja",
    });
    const parsedState = readSavedQuizState();

    setLocale(resolvedLocale);
    setTheme(storedTheme ?? "system");
    setAnswers(parsedState?.answers ?? {});
    setCurrentIndex(parsedState?.currentIndex ?? 0);

    if (parsedState?.answers && Object.keys(parsedState.answers).length === quizQuestions.length) {
      setScreen("result");
    } else {
      setScreen("intro");
    }
  }, [initialLocaleParam, searchParams]);

  useEffect(() => {
    if (screen === "loading") {
      return;
    }

    window.localStorage.setItem(LOCALE_KEY, locale);
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", locale);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [locale, pathname, router, screen, searchParams]);

  useEffect(() => {
    if (screen === "loading") {
      return;
    }

    window.localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify({ answers, currentIndex }));
  }, [answers, currentIndex, screen]);

  useEffect(() => {
    if (screen === "loading") {
      return;
    }

    window.localStorage.setItem(THEME_KEY, theme);
    document.documentElement.dataset.theme = resolveTheme(theme);
  }, [screen, theme]);

  useEffect(() => {
    if (screen === "loading") {
      return;
    }

    document.documentElement.lang = locale;
  }, [locale, screen]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const dictionary = messages[locale];
  const question = quizQuestions[currentIndex];
  const selectedAnswer = question ? answers[question.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / quizQuestions.length) * 100);
  const result = answeredCount === quizQuestions.length ? calculateQuizResult(quizQuestions, answers) : null;
  const profile = result ? getTypeProfile(result.type, locale) : null;
  const shareText =
    result && profile
      ? format(dictionary.shareText, {
          type: result.type,
          title: profile.title,
          reliability: result.reliability.score,
        })
      : "";

  const chartData = useMemo(() => {
    if (!result) {
      return [];
    }

    return axisOrder.map((axisKey) => {
      const axis = result.axisScores[axisKey];
      const axisMessage = dictionary.axes[axisKey];

      return {
        axis: axisKey,
        leftLabel: `${axisMessage.left} ${axisMessage.leftWord}`,
        rightLabel: `${axisMessage.right} ${axisMessage.rightWord}`,
        score: axis.score,
      };
    });
  }, [dictionary.axes, result]);

  function setLocaleAndPersist(value: SupportedLocale) {
    startTransition(() => setLocale(value));
  }

  function handleAnswer(value: AnswerValue) {
    if (!question) {
      return;
    }

    const nextAnswers = {
      ...answers,
      [question.id]: value,
    };

    setAnswers(nextAnswers);

    startTransition(() => {
      if (currentIndex >= quizQuestions.length - 1) {
        setScreen("result");
      } else {
        setCurrentIndex((current) => current + 1);
      }
    });
  }

  function handleRestart() {
    setAnswers({});
    setCurrentIndex(0);
    setScreen("intro");
    window.localStorage.removeItem(QUIZ_STATE_KEY);
  }

  async function handleCopy() {
    if (!shareText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      window.prompt(dictionary.copy, shareText);
    }
  }

  function handleShare() {
    if (!shareText) {
      return;
    }

    const intent = new URL("https://twitter.com/intent/tweet");
    intent.searchParams.set("text", shareText);
    window.open(intent.toString(), "_blank", "noopener,noreferrer");
  }

  if (screen === "loading") {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center justify-center px-4 py-16 sm:px-6">
        <Card className="w-full max-w-xl border-white/10 bg-white/6">
          <CardContent className="p-8 text-center text-sm text-[color:var(--muted-foreground)]">
            {dictionary.loading}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-card backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
            <Sparkles className="h-3.5 w-3.5" />
            {dictionary.heroEyebrow}
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl">{dictionary.appName}</h1>
            <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">{dictionary.tagline}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2">
            <Globe2 className="h-4 w-4 text-[color:var(--muted-foreground)]" />
            <select
              aria-label={dictionary.language}
              className="bg-transparent text-sm outline-none"
              onChange={(event) => setLocaleAndPersist(event.target.value as SupportedLocale)}
              value={locale}
            >
              {localeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2 py-2">
            {[["system", dictionary.themeSystem], ["light", dictionary.themeLight], ["dark", dictionary.themeDark]].map(
              ([value, label]) => (
                <button
                  key={value}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs transition",
                    theme === value ? "bg-white text-black" : "text-[color:var(--muted-foreground)] hover:text-white",
                  )}
                  onClick={() => setTheme(value as ThemeMode)}
                  type="button"
                >
                  {value === "light" ? <SunMedium className="mr-1 inline h-3.5 w-3.5" /> : null}
                  {value === "dark" ? <MoonStar className="mr-1 inline h-3.5 w-3.5" /> : null}
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
      </header>

      {screen === "intro" ? (
        <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(248,113,113,0.16),rgba(15,23,42,0.18),rgba(56,189,248,0.14))]">
            <CardContent className="space-y-7 p-8 sm:p-10">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--muted-foreground)]">
                  {dictionary.premiumLabel}
                </p>
                <h2 className="max-w-3xl text-4xl leading-tight sm:text-5xl">{dictionary.heroTitle}</h2>
                <p className="max-w-2xl text-base leading-8 text-[color:var(--muted-foreground)]">
                  {dictionary.heroDescription}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {(Object.values(dictionary.heroPoints) as string[]).map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-[color:var(--muted-foreground)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setScreen("quiz")} size="lg">
                  {answeredCount > 0 ? dictionary.resume : dictionary.start}
                </Button>
                {answeredCount > 0 ? (
                  <Button onClick={handleRestart} size="lg" variant="outline">
                    {dictionary.restart}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="border-white/10 bg-white/6">
              <CardHeader>
                <CardTitle>{dictionary.browserNote}</CardTitle>
                <CardDescription>{dictionary.questionGuide}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {axisOrder.map((axisKey) => (
                  <div key={axisKey} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{dictionary.axes[axisKey].label}</span>
                      <span className="text-[color:var(--muted-foreground)]">
                        {dictionary.axes[axisKey].left} / {dictionary.axes[axisKey].right}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                      {dictionary.axes[axisKey].description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-white/10 bg-white/6">
              <CardContent className="flex items-center justify-between gap-4 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                    {dictionary.progressLabel}
                  </p>
                  <p className="mt-2 text-3xl font-semibold">{progress}%</p>
                </div>
                <div className="flex-1">
                  <div className="h-3 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#f97316,#eab308,#38bdf8)] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-[color:var(--muted-foreground)]">
                    {format(dictionary.questionCount, {
                      current: answeredCount,
                      total: quizQuestions.length,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      {screen === "quiz" && question ? (
        <section className="space-y-6">
          <Card className="border-white/10 bg-white/6">
            <CardContent className="space-y-5 p-6 sm:p-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--muted-foreground)]">
                    {dictionary.progressLabel}
                  </p>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {format(dictionary.questionCount, {
                      current: currentIndex + 1,
                      total: quizQuestions.length,
                    })}
                  </p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#fb7185,#f59e0b,#22c55e)] transition-all duration-500"
                    style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

                <div key={question.id} className="animate-card-in rounded-[26px] border border-white/10 bg-black/20 p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                  {question.axis} / {dictionary.axes[question.axis].label}
                </p>
                <h2 className="mt-4 text-2xl leading-relaxed sm:text-3xl">{question.text[locale]}</h2>
                <p className="mt-4 text-sm text-[color:var(--muted-foreground)]">{dictionary.questionGuide}</p>
              </div>

              <div className="grid gap-3">
                {likertOptions.map((option) => (
                  <button
                    key={option}
                    className={cn(
                      "rounded-[24px] border p-4 text-left transition duration-200",
                      selectedAnswer === option
                        ? "border-white bg-white text-black shadow-soft"
                        : "border-white/10 bg-black/10 text-white hover:border-white/30 hover:bg-white/8",
                    )}
                    onClick={() => handleAnswer(option)}
                    type="button"
                  >
                    <span className="text-sm font-semibold">{dictionary.answers[option]}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  onClick={() => {
                    if (currentIndex === 0) {
                      setScreen("intro");
                      return;
                    }

                    startTransition(() => setCurrentIndex((current) => current - 1));
                  }}
                  variant="ghost"
                >
                  {dictionary.back}
                </Button>
                <Button
                  disabled={!selectedAnswer}
                  onClick={() => {
                    if (!selectedAnswer) {
                      return;
                    }

                    if (currentIndex >= quizQuestions.length - 1) {
                      setScreen("result");
                    } else {
                      startTransition(() => setCurrentIndex((current) => current + 1));
                    }
                  }}
                  variant="outline"
                >
                  {currentIndex >= quizQuestions.length - 1 ? dictionary.finish : dictionary.next}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {screen === "result" && result && profile ? (
        <section className="space-y-6">
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(249,115,22,0.12),rgba(15,23,42,0.3))]">
            <CardContent className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr,0.9fr]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--muted-foreground)]">
                    {dictionary.resultTitle}
                  </p>
                  <h2 className="text-5xl sm:text-6xl">{result.type}</h2>
                  <p className="text-lg text-[color:var(--muted-foreground)]">{profile.title}</p>
                </div>
                <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
                    {dictionary.snarkLabel}
                  </p>
                  <p className="mt-3 text-lg leading-8">{resultCommentMap[result.type][locale]}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    {dictionary.share}
                  </Button>
                  <Button onClick={handleCopy} variant="outline">
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? dictionary.shareCopied : dictionary.copy}
                  </Button>
                  <Button onClick={handleRestart} variant="ghost">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {dictionary.restartShort}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="border-white/10 bg-black/20">
                  <CardHeader>
                    <CardTitle>{dictionary.reliabilityTitle}</CardTitle>
                    <CardDescription>{dictionary.resultHint}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-end gap-3">
                      <span className="text-5xl font-semibold">{result.reliability.score}%</span>
                      <span className="pb-2 text-sm text-[color:var(--muted-foreground)]">
                        {result.reliability.tier === "high"
                          ? dictionary.reliabilityHigh
                          : result.reliability.tier === "moderate"
                            ? dictionary.reliabilityModerate
                            : dictionary.reliabilityLow}
                      </span>
                    </div>
                    <p className="text-sm leading-7 text-[color:var(--muted-foreground)]">
                      {dictionary.reliabilityDescription}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-black/20">
                  <CardHeader>
                    <CardTitle>{dictionary.axisTitle}</CardTitle>
                    <CardDescription>{dictionary.axisDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AxisBarChart data={chartData} />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {([
              [dictionary.strengths, profile.strengths],
              [dictionary.weaknesses, profile.weaknesses],
              [dictionary.tendencies, profile.tendencies],
              [dictionary.cautions, profile.cautions],
            ] as ResultSection[]).map(([label, items]) => (
              <Card key={label} className="border-white/10 bg-white/6">
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <div key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7">
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
