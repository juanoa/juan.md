import {
  CheckSquareIcon,
  LinkIcon,
  ListBulletsIcon,
  TextBIcon,
  TextItalicIcon,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";

import { Button } from "@juan/ui/components/ui/button";
import { Input } from "@juan/ui/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@juan/ui/components/ui/sheet";
import { Textarea } from "@juan/ui/components/ui/textarea";

import type { TodoTask } from "../../lib/todos/types";
import { MarkdownText } from "./markdown";
import { useTodosContext } from "./TodosContext";

interface TodoNotesSheetProps {
  task: TodoTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodoNotesSheet({
  task,
  open,
  onOpenChange,
}: TodoNotesSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Notes</SheetTitle>
        </SheetHeader>
        {task && (
          <TodoNotesEditor
            key={task.id}
            task={task}
            onDone={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function TodoNotesEditor({
  task,
  onDone,
}: {
  task: TodoTask;
  onDone: () => void;
}) {
  const { updateTask, updateRecurringTodo } = useTodosContext();
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (before: string, after = before, fallback = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = notes.slice(start, end) || fallback;
    const next = `${notes.slice(0, start)}${before}${selected}${after}${notes.slice(end)}`;
    setNotes(next);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  };

  const save = async () => {
    await updateTask(task.id, {
      title: title.trim() || task.title,
      notes,
    });
    onDone();
  };

  const applyToSeries = async () => {
    if (!task.recurringSeriesId) return;
    await updateRecurringTodo(task.recurringSeriesId, { notes });
    await save();
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="To-do"
        />
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => insertSnippet("**", "**", "bold")}
            aria-label="Bold">
            <TextBIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => insertSnippet("*", "*", "italic")}
            aria-label="Italic">
            <TextItalicIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => insertSnippet("[", "](https://example.com)", "link")}
            aria-label="Link">
            <LinkIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => insertSnippet("- ", "", "item")}
            aria-label="Bullet">
            <ListBulletsIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => insertSnippet("[] ", "", "subtask")}
            aria-label="Checklist">
            <CheckSquareIcon />
          </Button>
        </div>
        <Textarea
          ref={textareaRef}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-56 resize-y"
          placeholder="Notes"
        />
        {notes.trim().length > 0 && (
          <div className="border-border text-foreground [&_a]:text-primary space-y-1 border p-3 text-xs/relaxed [&_a]:underline">
            <MarkdownText value={notes} />
          </div>
        )}
      </div>
      <SheetFooter className="border-border border-t">
        {task.recurringSeriesId && (
          <Button type="button" variant="outline" onClick={applyToSeries}>
            Apply to series
          </Button>
        )}
        <Button type="button" onClick={save}>
          Save
        </Button>
      </SheetFooter>
    </>
  );
}
