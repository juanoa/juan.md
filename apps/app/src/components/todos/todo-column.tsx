import { useDroppable } from "@dnd-kit/core";
import { useRef, useState } from "react";
import type { PointerEvent } from "react";

import { cn } from "@juan/ui/lib/utils";

import {
  accessibleDateLabel,
  dayLabel,
  dayNumberLabel,
  longDayLabel,
} from "../../lib/todos/date";
import type { TodoTask } from "../../lib/todos/types";
import { TodoAddInput } from "./todo-add-input";
import { TodoTaskItem } from "./todo-task-item";

interface TodoColumnProps {
  date: Date;
  isoDate: string;
  isToday: boolean;
  tasks: TodoTask[];
  onOpenNotes: (task: TodoTask) => void;
}

export function todoDroppableDateId(date: string): string {
  return `date:${date}`;
}

export function todoDroppableTickerId(date: string): string {
  return `ticker:${date}`;
}

export function TodoColumn({
  date,
  isoDate,
  isToday,
  tasks,
  onOpenNotes,
}: TodoColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: todoDroppableDateId(isoDate),
  });
  const [showTopInput, setShowTopInput] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const pointerStartRef = useRef<number | null>(null);
  const accessible = accessibleDateLabel(isoDate);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, select, button")) return;
    pointerStartRef.current = event.clientY;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStartRef.current === null) return;
    const delta = event.clientY - pointerStartRef.current;
    if (delta > 0) setPullDistance(Math.min(delta, 88));
  };

  const handlePointerUp = () => {
    if (pullDistance > 64) setShowTopInput(true);
    pointerStartRef.current = null;
    setPullDistance(0);
  };

  return (
    <section
      ref={setNodeRef}
      aria-label={accessible}
      className={cn(
        "border-border bg-card flex min-h-[28rem] flex-col border transition-colors",
        isToday && "border-primary/50",
        isOver && "bg-primary/5 ring-primary/30 ring-1",
      )}>
      <header className="border-border flex items-baseline justify-between border-b px-3 py-2">
        <div>
          <h2 className="text-sm font-medium">{dayLabel(date)}</h2>
          <p className="text-muted-foreground text-xs">{longDayLabel(date)}</p>
        </div>
        <span
          className={cn(
            "text-muted-foreground text-2xl leading-none tabular-nums",
            isToday && "text-primary",
          )}>
          {dayNumberLabel(date)}
        </span>
      </header>

      <div
        className="flex flex-1 flex-col"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}>
        {pullDistance > 12 && (
          <div
            className="text-muted-foreground grid place-items-center overflow-hidden text-xs transition-[height]"
            style={{ height: pullDistance }}>
            +
          </div>
        )}
        {showTopInput && (
          <div className="border-border border-b p-2">
            <TodoAddInput
              scope={{ kind: "date", date: isoDate }}
              atTop
              autoFocus
              onCreated={() => setShowTopInput(false)}
            />
          </div>
        )}
        <div className="flex flex-1 flex-col">
          {tasks.map((task) => (
            <TodoTaskItem key={task.id} task={task} onOpenNotes={onOpenNotes} />
          ))}
        </div>
      </div>

      <div className="border-border border-t p-2">
        <TodoAddInput scope={{ kind: "date", date: isoDate }} />
      </div>
    </section>
  );
}
