import { useDroppable } from "@dnd-kit/core";

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
  dragEnabled?: boolean;
}

export function todoDroppableDateId(date: string): string {
  return `date:${date}`;
}

export function TodoColumn({
  date,
  isoDate,
  isToday,
  tasks,
  onOpenNotes,
  dragEnabled = false,
}: TodoColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: todoDroppableDateId(isoDate),
    disabled: !dragEnabled,
  });
  const accessible = accessibleDateLabel(isoDate);

  return (
    <section
      ref={setNodeRef}
      aria-label={accessible}
      className={cn(
        "border-border bg-card flex min-h-[28rem] flex-col border transition-colors",
        isToday && "border-primary/50",
        dragEnabled && isOver && "bg-primary/5 ring-primary/30 ring-1",
      )}>
      <header className="border-border flex items-baseline justify-between border-b px-3 py-2">
        <div>
          <h2 className="text-sm font-medium">{dayLabel(date)}</h2>
          <p className="text-muted-foreground text-xs">{longDayLabel(date)}</p>
        </div>
        <span
          className={cn(
            "text-muted-foreground text-2xl leading-none tabular-nums",
            isToday && "text-destructive",
          )}>
          {dayNumberLabel(date)}
        </span>
      </header>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">
          {tasks.map((task) => (
            <TodoTaskItem
              key={task.id}
              task={task}
              onOpenNotes={onOpenNotes}
              dragEnabled={dragEnabled}
            />
          ))}
        </div>
      </div>

      <div className="border-border border-t p-2">
        <TodoAddInput scope={{ kind: "date", date: isoDate }} />
      </div>
    </section>
  );
}
