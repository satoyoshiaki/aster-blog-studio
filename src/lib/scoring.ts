import type { Axis, Question } from "@/lib/quiz-types";

export const likertOptions = [
  "stronglyAgree",
  "agree",
  "neutral",
  "disagree",
  "stronglyDisagree",
] as const;

export type AnswerValue = (typeof likertOptions)[number];

const answerScoreMap: Record<AnswerValue, number> = {
  stronglyAgree: 2,
  agree: 1,
  neutral: 0,
  disagree: -1,
  stronglyDisagree: -2,
};

const axisDefinitions = {
  EI: { positive: "E", negative: "I" },
  SN: { positive: "S", negative: "N" },
  TF: { positive: "T", negative: "F" },
  JP: { positive: "J", negative: "P" },
} as const;

export function getAnswerNumericValue(answer: AnswerValue) {
  return answerScoreMap[answer];
}

function normalizeForAxis(question: Question, answer: AnswerValue) {
  const base = getAnswerNumericValue(answer);
  return question.direction === "positive" ? base : base * -1;
}

export function getReliabilityTier(score: number) {
  if (score >= 75) {
    return "high";
  }

  if (score >= 50) {
    return "moderate";
  }

  return "low";
}

export function calculateQuizResult(questions: Question[], answers: Record<string, AnswerValue>) {
  const axisBuckets = new Map<
    Axis,
    {
      weightedScore: number;
      maxScore: number;
      rawScore: number;
      firstLetterValue: number;
      secondLetterValue: number;
    }
  >([
    ["EI", { weightedScore: 0, maxScore: 0, rawScore: 0, firstLetterValue: 0, secondLetterValue: 0 }],
    ["SN", { weightedScore: 0, maxScore: 0, rawScore: 0, firstLetterValue: 0, secondLetterValue: 0 }],
    ["TF", { weightedScore: 0, maxScore: 0, rawScore: 0, firstLetterValue: 0, secondLetterValue: 0 }],
    ["JP", { weightedScore: 0, maxScore: 0, rawScore: 0, firstLetterValue: 0, secondLetterValue: 0 }],
  ]);

  const categoryBuckets = new Map<string, number[]>();

  for (const question of questions) {
    const answer = answers[question.id];

    if (!answer) {
      continue;
    }

    const normalized = normalizeForAxis(question, answer);
    const weighted = normalized * question.weight;
    const base = getAnswerNumericValue(answer);
    const axis = axisBuckets.get(question.axis);

    if (!axis) {
      continue;
    }

    axis.weightedScore += weighted;
    axis.maxScore += 2 * question.weight;
    axis.rawScore += base * question.weight;

    if (normalized >= 0) {
      axis.firstLetterValue += Math.abs(weighted);
    } else {
      axis.secondLetterValue += Math.abs(weighted);
    }

    const bucket = categoryBuckets.get(question.category) ?? [];
    bucket.push(normalized);
    categoryBuckets.set(question.category, bucket);
  }

  const axisScores = {} as Record<
    Axis,
    {
      axis: Axis;
      score: number;
      letter: string;
      firstLetter: string;
      secondLetter: string;
      balanced: boolean;
      firstLetterValue: number;
      secondLetterValue: number;
    }
  >;

  for (const [axis, value] of axisBuckets.entries()) {
    const definition = axisDefinitions[axis];
    const percent = value.maxScore === 0 ? 0 : Math.round((value.weightedScore / value.maxScore) * 100);
    let letter = percent >= 0 ? definition.positive : definition.negative;
    let balanced = percent === 0;

    if (percent === 0) {
      if (value.firstLetterValue > value.secondLetterValue) {
        letter = definition.positive;
        balanced = false;
      } else if (value.secondLetterValue > value.firstLetterValue) {
        letter = definition.negative;
        balanced = false;
      } else if (value.rawScore > 0) {
        letter = definition.positive;
        balanced = false;
      } else if (value.rawScore < 0) {
        letter = definition.negative;
        balanced = false;
      } else {
        letter = definition.negative;
      }
    }

    axisScores[axis] = {
      axis,
      score: percent,
      letter,
      firstLetter: definition.positive,
      secondLetter: definition.negative,
      balanced,
      firstLetterValue: Number(value.firstLetterValue.toFixed(2)),
      secondLetterValue: Number(value.secondLetterValue.toFixed(2)),
    };
  }

  const reliabilitySamples = Array.from(categoryBuckets.values())
    .filter((pair) => pair.length === 2)
    .map(([first, second]) => 1 - Math.abs(first - second) / 4);

  const reliabilityScore =
    reliabilitySamples.length === 0
      ? 0
      : Math.round(
          (reliabilitySamples.reduce((total, item) => total + item, 0) / reliabilitySamples.length) * 100,
        );

  const type = `${axisScores.EI.letter}${axisScores.SN.letter}${axisScores.TF.letter}${axisScores.JP.letter}`;

  return {
    type,
    axisScores,
    reliability: {
      score: reliabilityScore,
      tier: getReliabilityTier(reliabilityScore),
    },
  };
}
