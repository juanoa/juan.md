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

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
});

const dayNumberFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
});

const compactDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "numeric",
});

const accessibleDateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatShortDate(date: Date): string {
  return shortDateFormatter.format(date);
}

export function formatCompactISODate(value: string): string {
  return compactDateFormatter.format(parseISODate(value));
}

export function formatShortISODate(value: string): string {
  return formatShortDate(parseISODate(value));
}

export function formatAccessibleISODate(value: string): string {
  return accessibleDateFormatter.format(parseISODate(value));
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() + days);
  return result;
}

export function weekOfYear(date: Date): number {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
}

export function dayLabel(date: Date): string {
  return weekdayFormatter.format(date);
}

export function dayNumberLabel(date: Date): string {
  return dayNumberFormatter.format(date);
}

export function todayISO(): string {
  return formatISODate(new Date());
}
