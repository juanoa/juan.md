import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowRightIcon,
  CalendarBlankIcon,
  DotsSixVerticalIcon,
  DotsThreeVerticalIcon,
  NotePencilIcon,
  RepeatIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

import { Button } from "@juan/ui/components/ui/button";
import { Checkbox } from "@juan/ui/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@juan/ui/components/ui/dropdown-menu";
import { Input } from "@juan/ui/components/ui/input";
import { cn } from "@juan/ui/lib/utils";

import { addDaysISO, todayISO } from "../../lib/todos/date";
import type { TodoTask } from "../../lib/todos/types";
import { MarkdownText } from "./markdown";
import { useTodosContext } from "./TodosContext";

interface TodoTaskItemProps {
  task: TodoTask;
  onOpenNotes: (task: TodoTask) => void;
  dragEnabled?: boolean;
}

export function todoDraggableId(id: string): string {
  return `todo:${id}`;
}

export function todoDroppableTaskId(id: string): string {
  return `task:${id}`;
}

export function TodoTaskItem({
  task,
  onOpenNotes,
  dragEnabled = false,
}: TodoTaskItemProps) {
  const {
    lists,
    preferences,
    updateTask,
    toggleTask,
    deleteTask,
    deleteRecurringTodo,
    moveTask,
  } = useTodosContext();
  const completed = task.completedAt !== null;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: todoDroppableTaskId(task.id),
    disabled: !dragEnabled,
  });
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: todoDraggableId(task.id),
      disabled: !dragEnabled,
    });

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const displayTitle = task.title.startsWith("- ")
    ? task.title.slice(2)
    : task.title;
  const shouldStyleBullet =
    task.title.startsWith("- ") && preferences.bulletStyle !== "none";
  const bullet =
    preferences.bulletStyle === "circle"
      ? "•"
      : preferences.bulletStyle === "square"
        ? "▪"
        : "";

  const style: CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: dragEnabled && isDragging ? 0.45 : 1,
  };

  const saveDraft = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(task.title);
      setIsEditing(false);
      return;
    }
    if (trimmed !== task.title) {
      await updateTask(task.id, { title: trimmed });
    }
    setIsEditing(false);
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await saveDraft();
    }
    if (event.key === "Escape") {
      setDraft(task.title);
      setIsEditing(false);
    }
  };

  const nearbyDates = task.dueDate
    ? [
        { label: "Today", date: todayISO() },
        { label: "Tomorrow", date: addDaysISO(task.dueDate, 1) },
      ]
    : [{ label: "Today", date: todayISO() }];

  return (
    <div
      ref={setDropRef}
      className={cn(
        "relative isolate",
        dragEnabled && isOver && "bg-primary/5",
      )}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group/todo border-border bg-background relative z-10 flex min-h-9 items-start gap-2 border-b px-2 py-1.5 text-xs transition-[background,opacity]",
          dragEnabled && isDragging && "cursor-grabbing will-change-transform",
        )}>
        <Checkbox
          checked={completed}
          onCheckedChange={(checked) => toggleTask(task.id, checked === true)}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
          className="mt-0.5"
        />

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => void saveDraft()}
              className="bg-background h-7"
            />
          ) : (
            <button
              type="button"
              className={cn(
                "block w-full min-w-0 text-left leading-5 break-words",
                completed && "text-muted-foreground line-through",
                shouldStyleBullet &&
                  preferences.bulletStyle === "indent" &&
                  "pl-4",
              )}
              onClick={() => {
                setDraft(task.title);
                setIsEditing(true);
              }}>
              <span className="flex min-w-0 gap-1.5">
                {shouldStyleBullet && bullet && (
                  <span className="text-muted-foreground">{bullet}</span>
                )}
                <div className="min-w-0 flex-1">
                  <MarkdownText value={displayTitle} />
                </div>
              </span>
            </button>
          )}
          {(task.notes || task.recurringSeriesId) && (
            <div className="text-muted-foreground mt-1 flex items-center gap-1.5">
              {task.recurringSeriesId && <RepeatIcon className="size-3" />}
              {task.notes && <NotePencilIcon className="size-3" />}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 md:transition-opacity md:group-focus-within/todo:opacity-100 md:group-hover/todo:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onOpenNotes(task)}
            aria-label="Open notes">
            <NotePencilIcon />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Task menu">
                <DotsThreeVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Move</DropdownMenuLabel>
              <DropdownMenuGroup>
                {nearbyDates.map((date) => (
                  <DropdownMenuItem
                    key={date.label}
                    onSelect={() =>
                      void moveTask(task.id, {
                        kind: "date",
                        date: date.date,
                      })
                    }>
                    <CalendarBlankIcon />
                    {date.label}
                  </DropdownMenuItem>
                ))}
                {lists.map((list) => (
                  <DropdownMenuItem
                    key={list.id}
                    onSelect={() =>
                      void moveTask(task.id, {
                        kind: "list",
                        listId: list.id,
                      })
                    }>
                    <ArrowRightIcon />
                    {list.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => void deleteTask(task.id)}>
                <TrashIcon />
                Delete
              </DropdownMenuItem>
              {task.recurringSeriesId && (
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    if (task.recurringSeriesId) {
                      void deleteRecurringTodo(task.recurringSeriesId);
                    }
                  }}>
                  <RepeatIcon />
                  Delete series
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {dragEnabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="cursor-grab active:cursor-grabbing"
              aria-label="Drag to move"
              {...listeners}
              {...attributes}>
              <DotsSixVerticalIcon />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
