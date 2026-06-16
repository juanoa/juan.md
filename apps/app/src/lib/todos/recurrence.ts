import type { TodoFrequency } from "./types";

export const TODO_FREQUENCY_LABELS: Record<TodoFrequency, string> = {
  daily: "Every day",
  every_other_day: "Every other day",
  weekdays: "Every weekday",
  weekly: "Every week",
  every_other_week: "Every other week",
  monthly: "Every month",
  yearly: "Every year",
};

const RECURRENCE_SUFFIXES: { phrase: string; frequency: TodoFrequency }[] = [
  { phrase: "every other day", frequency: "every_other_day" },
  { phrase: "every other week", frequency: "every_other_week" },
  { phrase: "every weekday", frequency: "weekdays" },
  { phrase: "every day", frequency: "daily" },
  { phrase: "every week", frequency: "weekly" },
  { phrase: "every month", frequency: "monthly" },
  { phrase: "every year", frequency: "yearly" },
];

export function parseRecurringTodoTitle(
  input: string,
):
  | { recurring: true; title: string; frequency: TodoFrequency }
  | { recurring: false; title: string } {
  const normalized = input.trim().replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();

  for (const { phrase, frequency } of RECURRENCE_SUFFIXES) {
    if (!lower.endsWith(phrase)) continue;
    const title = normalized.slice(0, -phrase.length).trim();
    if (title.length === 0) break;
    return {
      recurring: true,
      title: title.replace(/[,\-:;]+$/u, "").trim(),
      frequency,
    };
  }

  return { recurring: false, title: normalized };
}

export function frequencyToNaturalLanguage(frequency: TodoFrequency): string {
  return TODO_FREQUENCY_LABELS[frequency];
}
