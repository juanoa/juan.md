import { PlusIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@juan/ui/components/ui/button";
import { Input } from "@juan/ui/components/ui/input";

import type { TodoScope } from "../../lib/todos/types";
import { useTodosContext } from "./TodosContext";

interface TodoAddInputProps {
  scope: TodoScope;
  atTop?: boolean;
  autoFocus?: boolean;
  onCreated?: () => void;
}

export function TodoAddInput({
  scope,
  atTop,
  autoFocus,
  onCreated,
}: TodoAddInputProps) {
  const { createTask } = useTodosContext();
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      await createTask({
        title: trimmed,
        dueDate: scope.kind === "date" ? scope.date : undefined,
        listId: scope.kind === "list" ? scope.listId : undefined,
        atTop,
      });
      setTitle("");
      onCreated?.();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="flex items-center gap-1" onSubmit={handleSubmit}>
      <Input
        ref={inputRef}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add to-do"
        className="bg-muted/30 focus-visible:bg-background h-7 border-transparent"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        disabled={isSaving || title.trim().length === 0}
        aria-label="Add to-do">
        <PlusIcon />
      </Button>
    </form>
  );
}
