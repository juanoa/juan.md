export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function todayISO(): string {
  return formatISODate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

export function addDaysISO(value: string, days: number): string {
  return formatISODate(addDays(parseISODate(value), days));
}

export function daysBetween(from: string, to: string): number {
  const start = parseISODate(from);
  const end = parseISODate(to);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
});

const longWeekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
});

const dayNumberFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
});

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

const accessibleFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function dayLabel(date: Date): string {
  return weekdayFormatter.format(date);
}

export function longDayLabel(date: Date): string {
  return longWeekdayFormatter.format(date);
}

export function dayNumberLabel(date: Date): string {
  return dayNumberFormatter.format(date);
}

export function shortDateLabel(date: Date): string {
  return shortDateFormatter.format(date);
}

export function monthLabel(date: Date): string {
  return monthFormatter.format(date);
}

export function accessibleDateLabel(value: string): string {
  return accessibleFormatter.format(parseISODate(value));
}

export function buildDayRange(startDate: string, count: number) {
  const start = parseISODate(startDate);
  return Array.from({ length: count }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      iso: formatISODate(date),
    };
  });
}
