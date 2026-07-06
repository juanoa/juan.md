import { useCallback, useEffect, useState } from "react";

const MIDNIGHT_REFRESH_DELAY = 1000;

function localISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function currentDayISO(): string {
  return localISODate(new Date());
}

function millisecondsUntilNextDay(): number {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  return Math.max(tomorrow.getTime() - now.getTime(), 0);
}

export function useCurrentDay(): string {
  const [currentDay, setCurrentDay] = useState(currentDayISO);

  const refreshCurrentDay = useCallback(() => {
    setCurrentDay((value) => {
      const next = currentDayISO();
      return next === value ? value : next;
    });
  }, []);

  useEffect(() => {
    let active = true;
    let timeoutId: number | undefined;

    const scheduleNextDay = () => {
      if (!active) return;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        refreshCurrentDay();
        scheduleNextDay();
      }, millisecondsUntilNextDay() + MIDNIGHT_REFRESH_DELAY);
    };

    const handleResume = () => {
      refreshCurrentDay();
      scheduleNextDay();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") handleResume();
    };

    scheduleNextDay();
    window.addEventListener("focus", handleResume);
    window.addEventListener("pageshow", handleResume);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      window.removeEventListener("focus", handleResume);
      window.removeEventListener("pageshow", handleResume);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshCurrentDay]);

  return currentDay;
}
