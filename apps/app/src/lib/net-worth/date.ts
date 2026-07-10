const MONTH_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

const COMPACT_MONTH_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  year: "2-digit",
});

function parseMonthParts(month: string): { year: number; monthIndex: number } {
  const [year, monthNumber] = month.split("-").map(Number);
  return { year, monthIndex: monthNumber - 1 };
}

function monthDate(month: string): Date {
  const { year, monthIndex } = parseMonthParts(month);
  return new Date(year, monthIndex, 1);
}

export function formatMonth(month: string): string {
  return MONTH_FORMATTER.format(monthDate(month));
}

export function formatCompactMonth(month: string): string {
  return COMPACT_MONTH_FORMATTER.format(monthDate(month));
}

export function formatMonthInput(month: string): string {
  return month.slice(0, 7);
}

export function monthInputToSnapshotMonth(month: string): string {
  return `${month}-01`;
}

export function nextMonth(month: string): string {
  const { year, monthIndex } = parseMonthParts(month);
  const date = new Date(year, monthIndex + 1, 1);
  const nextYear = date.getFullYear();
  const nextMonthNumber = String(date.getMonth() + 1).padStart(2, "0");
  return `${nextYear}-${nextMonthNumber}-01`;
}
