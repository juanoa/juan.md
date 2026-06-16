import { useDroppable } from "@dnd-kit/core";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  DotsThreeVerticalIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import { Button } from "@juan/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@juan/ui/components/ui/dropdown-menu";
import { Input } from "@juan/ui/components/ui/input";
import { cn } from "@juan/ui/lib/utils";

import type { TodoList, TodoTask } from "../../lib/todos/types";
import { TodoAddInput } from "./todo-add-input";
import { useTodosContext } from "./TodosContext";
import { TodoTaskItem } from "./todo-task-item";

interface TodoSomedayListsProps {
  lists: TodoList[];
  tasksByList: Map<string, TodoTask[]>;
  onOpenNotes: (task: TodoTask) => void;
}

export function todoDroppableListId(id: string): string {
  return `list:${id}`;
}

export function TodoSomedayLists({
  lists,
  tasksByList,
  onOpenNotes,
}: TodoSomedayListsProps) {
  const { createList } = useTodosContext();
  const [name, setName] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await createList(trimmed);
    setName("");
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Someday</h2>
        <form
          className="flex w-full max-w-56 items-center gap-1"
          onSubmit={handleSubmit}>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="New list"
            className="h-7"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            disabled={name.trim().length === 0}
            aria-label="Create list">
            <PlusIcon />
          </Button>
        </form>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {lists.map((list, index) => (
          <SomedayListColumn
            key={list.id}
            list={list}
            index={index}
            listCount={lists.length}
            tasks={tasksByList.get(list.id) ?? []}
            onOpenNotes={onOpenNotes}
          />
        ))}
      </div>
    </section>
  );
}

function SomedayListColumn({
  list,
  index,
  listCount,
  tasks,
  onOpenNotes,
}: {
  list: TodoList;
  index: number;
  listCount: number;
  tasks: TodoTask[];
  onOpenNotes: (task: TodoTask) => void;
}) {
  const { updateList, moveList, deleteList } = useTodosContext();
  const { setNodeRef, isOver } = useDroppable({
    id: todoDroppableListId(list.id),
  });
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(list.name);

  const saveDraft = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(list.name);
      setIsEditing(false);
      return;
    }
    if (trimmed !== list.name) await updateList(list.id, { name: trimmed });
    setIsEditing(false);
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      await saveDraft();
    }
    if (event.key === "Escape") {
      setDraft(list.name);
      setIsEditing(false);
    }
  };

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "border-border bg-card flex min-h-72 flex-col border transition-colors",
        isOver && "bg-primary/5 ring-primary/30 ring-1",
      )}>
      <header className="border-border flex min-h-10 items-center gap-2 border-b px-3 py-2">
        {isEditing ? (
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => void saveDraft()}
            className="h-7"
            autoFocus
          />
        ) : (
          <button
            type="button"
            className="min-w-0 flex-1 text-left text-sm font-medium"
            onClick={() => setIsEditing(true)}>
            {list.name}
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="List menu">
              <DotsThreeVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              disabled={index === 0}
              onSelect={() => void moveList(list.id, -1)}>
              <ArrowLeftIcon />
              Move left
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={index === listCount - 1}
              onSelect={() => void moveList(list.id, 1)}>
              <ArrowRightIcon />
              Move right
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                if (window.confirm(`Delete "${list.name}"?`)) {
                  void deleteList(list.id);
                }
              }}>
              <TrashIcon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex flex-1 flex-col">
        {tasks.map((task) => (
          <TodoTaskItem key={task.id} task={task} onOpenNotes={onOpenNotes} />
        ))}
      </div>

      <div className="border-border border-t p-2">
        <TodoAddInput scope={{ kind: "list", listId: list.id }} />
      </div>
    </section>
  );
}
