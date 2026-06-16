import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { Button } from "@juan/ui/components/ui/button";

import {
  addDays,
  formatISODate,
  startOfWeek,
  todayISO,
  weekOfYear,
} from "../../lib/gym/date";
import { useGymContext } from "./GymContext";
import { DayCard } from "./day-card";

export function WeekCalendar() {
  const { sessions, moveSession } = useGymContext();
  const [weekOffset, setWeekOffset] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const today = useMemo(() => new Date(), []);
  const todayIso = todayISO();
  const weekStart = useMemo(
    () => addDays(startOfWeek(today), weekOffset * 7),
    [today, weekOffset],
  );

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        return { date, iso: formatISODate(date) };
      }),
    [weekStart],
  );

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, (typeof sessions)[number][]>();
    for (const session of sessions) {
      const daySessions = map.get(session.date) ?? [];
      daySessions.push(session);
      map.set(session.date, daySessions);
    }
    return map;
  }, [sessions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || typeof over.id !== "string" || typeof active.id !== "string") {
      return;
    }
    if (!over.id.startsWith("day-")) return;
    const targetDate = over.id.slice("day-".length);
    moveSession(active.id, targetDate);
  };

  const label =
    weekOffset === 0
      ? "This week"
      : weekOffset === -1
        ? "Last week"
        : weekOffset === 1
          ? "Next week"
          : `Week of ${formatISODate(weekStart)}`;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium">{label}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setWeekOffset((value) => value - 1)}
            aria-label="Previous week">
            <CaretLeftIcon />
          </Button>
          <span className="text-muted-foreground min-w-16 text-center text-xs tabular-nums">
            Week {weekOfYear(weekStart)}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setWeekOffset((value) => value + 1)}
            aria-label="Next week">
            <CaretRightIcon />
          </Button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {days.map(({ date, iso }) => (
            <DayCard
              key={iso}
              date={date}
              isoDate={iso}
              isToday={iso === todayIso}
              sessions={sessionsByDate.get(iso) ?? []}
            />
          ))}
        </div>
      </DndContext>
    </section>
  );
}
