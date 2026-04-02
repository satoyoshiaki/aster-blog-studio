import { QuizApp } from "@/components/quiz-app";

export default function HomePage({
  searchParams,
}: {
  searchParams?: { lang?: string };
}) {
  return <QuizApp initialLocaleParam={searchParams?.lang ?? null} />;
}
