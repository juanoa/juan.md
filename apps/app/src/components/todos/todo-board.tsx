import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  CaretLeftIcon,
  CaretRightIcon,
  ClockCountdownIcon,
  GearIcon,
  MagnifyingGlassIcon,
  RepeatIcon,
  TimerIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@juan/ui/components/ui/button";
import { Input } from "@juan/ui/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@juan/ui/components/ui/tooltip";
import { cn } from "@juan/ui/lib/utils";

import {
  addDaysISO,
  buildDayRange,
  dayLabel,
  dayNumberLabel,
  monthLabel,
  parseISODate,
  shortDateLabel,
  todayISO,
} from "../../lib/todos/date";
import type { TodoScope, TodoTask } from "../../lib/todos/types";
import { TodoColumn, todoDroppableTickerId } from "./todo-column";
import { TodoNotesSheet } from "./todo-notes-sheet";
import { TodoPreferencesSheet } from "./todo-preferences-sheet";
import { TodoRecurringSheet } from "./todo-recurring-sheet";
import { TodoSomedayLists } from "./todo-someday-lists";
import { useTodosContext } from "./TodosContext";

export function TodoBoard() {
  const {
    status,
    error,
    tasks,
    lists,
    preferences,
    lastDeletedTask,
    getTasksForDate,
    getTasksForList,
    placeTask,
    undoDelete,
  } = useTodosContext();
  const [startDate, setStartDate] = useState(todayISO());
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [notesTaskId, setNotesTaskId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(
    preferences.focusMinutes * 60,
  );
  const [timerRunning, setTimerRunning] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const columnCount = focusMode ? 1 : preferences.columnCount;
  const days = useMemo(
    () => buildDayRange(startDate, columnCount),
    [columnCount, startDate],
  );
  const mobileTickerDays = useMemo(
    () => buildDayRange(startDate, 7),
    [startDate],
  );
  const today = todayISO();
  const selectedTask = tasks.find((task) => task.id === notesTaskId) ?? null;
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const shiftDays = useCallback((amount: number) => {
    setStartDate((value) => addDaysISO(value, amount));
    setSelectedDate((value) => addDaysISO(value, amount));
  }, []);

  const jumpToToday = useCallback(() => {
    const value = todayISO();
    setStartDate(value);
    setSelectedDate(value);
  }, []);

  const enterFocusMode = () => {
    const value = todayISO();
    setFocusMode(true);
    setStartDate(value);
    setSelectedDate(value);
    setTimerSeconds(preferences.focusMinutes * 60);
    setTimerRunning(false);
  };

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setTimerSeconds((value) => {
        if (value <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable=true]")) {
        return;
      }

      if (event.key === "[") {
        event.preventDefault();
        shiftDays(event.ctrlKey || event.metaKey ? -columnCount : -1);
      }
      if (event.key === "]") {
        event.preventDefault();
        shiftDays(event.ctrlKey || event.metaKey ? columnCount : 1);
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "H"
      ) {
        event.preventDefault();
        jumpToToday();
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "F"
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "Z"
      ) {
        event.preventDefault();
        void undoDelete();
      }
      if (event.key === "Escape" && focusMode) {
        setFocusMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [columnCount, focusMode, jumpToToday, shiftDays, undoDelete]);

  const filterTasks = useCallback(
    (entries: TodoTask[]) => {
      if (!normalizedSearch) return entries;
      return entries.filter((task) =>
        `${task.title} ${task.notes}`.toLowerCase().includes(normalizedSearch),
      );
    },
    [normalizedSearch],
  );

  const tasksByList = useMemo(() => {
    const map = new Map<string, TodoTask[]>();
    for (const list of lists) {
      map.set(list.id, filterTasks(getTasksForList(list.id)));
    }
    return map;
  }, [filterTasks, getTasksForList, lists]);

  const selectedDay = useMemo(
    () => buildDayRange(selectedDate, 1)[0],
    [selectedDate],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : "";
    if (!activeId.startsWith("todo:") || !overId) return;

    const taskId = activeId.slice("todo:".length);
    const target = scopeFromDroppableId(overId);
    if (target) {
      void placeTask(taskId, target);
      return;
    }

    if (overId.startsWith("task:")) {
      const overTaskId = overId.slice("task:".length);
      if (overTaskId === taskId) return;
      const overTask = tasks.find((task) => task.id === overTaskId);
      const overScope = scopeFromTask(overTask);
      if (overScope) void placeTask(taskId, overScope, overTaskId);
    }
  };

  if (status === "loading") {
    return (
      <div className="text-muted-foreground grid min-h-80 place-items-center text-sm">
        Loading to-dos...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="border-destructive/30 bg-destructive/5 text-destructive border p-4 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <ToolbarButton
              label="Previous"
              onClick={() => shiftDays(-columnCount)}>
              <CaretLeftIcon />
            </ToolbarButton>
            <Button variant="outline" size="sm" onClick={jumpToToday}>
              Today
            </Button>
            <ToolbarButton label="Next" onClick={() => shiftDays(columnCount)}>
              <CaretRightIcon />
            </ToolbarButton>
            <span className="text-muted-foreground ml-2 text-xs">
              {monthLabel(parseISODate(startDate))}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {lastDeletedTask && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void undoDelete()}>
                Undo
              </Button>
            )}
            <ToolbarButton
              label="Search"
              onClick={() => setSearchOpen((value) => !value)}>
              <MagnifyingGlassIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Recurring"
              onClick={() => setRecurringOpen(true)}>
              <RepeatIcon />
            </ToolbarButton>
            <ToolbarButton label="Focus" onClick={enterFocusMode}>
              <TimerIcon />
            </ToolbarButton>
            <ToolbarButton
              label="Preferences"
              onClick={() => setPreferencesOpen(true)}>
              <GearIcon />
            </ToolbarButton>
          </div>
        </div>

        {searchOpen && (
          <div className="flex items-center gap-1">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setSearchQuery("");
                setSearchOpen(false);
              }}
              aria-label="Close search">
              <XIcon />
            </Button>
          </div>
        )}

        {focusMode && (
          <div className="border-border bg-card flex flex-wrap items-center justify-between gap-2 border p-2">
            <div className="flex items-center gap-2 text-sm font-medium tabular-nums">
              <ClockCountdownIcon className="text-muted-foreground size-4" />
              {formatTimer(timerSeconds)}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTimerRunning((value) => !value)}>
                {timerRunning ? "Pause" : "Start"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(preferences.focusMinutes * 60);
                }}>
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFocusMode(false)}>
                Exit
              </Button>
            </div>
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}>
        <div
          className="hidden gap-3 overflow-x-auto md:grid"
          style={{
            gridTemplateColumns: `repeat(${days.length}, minmax(12rem, 1fr))`,
          }}>
          {days.map(({ date, iso }) => (
            <TodoColumn
              key={iso}
              date={date}
              isoDate={iso}
              isToday={iso === today}
              tasks={filterTasks(getTasksForDate(iso))}
              onOpenNotes={(task) => setNotesTaskId(task.id)}
            />
          ))}
        </div>

        {selectedDay && (
          <div className="flex flex-col gap-3 md:hidden">
            <TodoColumn
              date={selectedDay.date}
              isoDate={selectedDay.iso}
              isToday={selectedDay.iso === today}
              tasks={filterTasks(getTasksForDate(selectedDay.iso))}
              onOpenNotes={(task) => setNotesTaskId(task.id)}
            />
            <div className="border-border bg-background/95 sticky bottom-0 z-20 grid grid-cols-7 gap-1 border p-1 supports-backdrop-filter:backdrop-blur">
              {mobileTickerDays.map(({ date, iso }) => (
                <MobileTickerDay
                  key={iso}
                  date={date}
                  isoDate={iso}
                  selected={iso === selectedDate}
                  isToday={iso === today}
                  onClick={() => setSelectedDate(iso)}
                />
              ))}
            </div>
          </div>
        )}

        {!focusMode && (
          <TodoSomedayLists
            lists={lists}
            tasksByList={tasksByList}
            onOpenNotes={(task) => setNotesTaskId(task.id)}
          />
        )}
      </DndContext>

      <TodoNotesSheet
        task={selectedTask}
        open={notesTaskId !== null}
        onOpenChange={(open) => {
          if (!open) setNotesTaskId(null);
        }}
      />
      <TodoRecurringSheet
        open={recurringOpen}
        onOpenChange={setRecurringOpen}
      />
      <TodoPreferencesSheet
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
      />
    </div>
  );
}

function scopeFromDroppableId(id: string): TodoScope | null {
  if (id.startsWith("date:")) {
    return { kind: "date", date: id.slice("date:".length) };
  }
  if (id.startsWith("ticker:")) {
    return { kind: "date", date: id.slice("ticker:".length) };
  }
  if (id.startsWith("list:")) {
    return { kind: "list", listId: id.slice("list:".length) };
  }
  return null;
}

function scopeFromTask(task: TodoTask | undefined): TodoScope | null {
  if (!task) return null;
  if (task.dueDate) return { kind: "date", date: task.dueDate };
  if (task.listId) return { kind: "list", listId: task.listId };
  return null;
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onClick={onClick}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function MobileTickerDay({
  date,
  isoDate,
  selected,
  isToday,
  onClick,
}: {
  date: Date;
  isoDate: string;
  selected: boolean;
  isToday: boolean;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: todoDroppableTickerId(isoDate),
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-12 flex-col items-center justify-center border border-transparent text-xs transition-colors",
        selected && "border-primary bg-primary/10 text-primary",
        isToday && !selected && "text-primary",
        isOver && "border-primary bg-primary/15",
      )}>
      <span>{dayLabel(date)}</span>
      <span className="font-medium tabular-nums">{dayNumberLabel(date)}</span>
      <span className="sr-only">{shortDateLabel(date)}</span>
    </button>
  );
}

function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
