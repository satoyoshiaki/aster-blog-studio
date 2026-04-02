export const supportedLocales = ["ja", "en", "ko", "zh-CN"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export type Axis = "EI" | "SN" | "TF" | "JP";

export type Direction = "positive" | "reverse";

export type Question = {
  id: string;
  axis: Axis;
  direction: Direction;
  weight: number;
  category: string;
  text: Record<SupportedLocale, string>;
};

export type ResultCommentRecord = Record<string, Record<SupportedLocale, string>>;
