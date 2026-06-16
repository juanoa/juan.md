import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@juan/ui/components/ui/button";
import { Input } from "@juan/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@juan/ui/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@juan/ui/components/ui/sheet";

import { todayISO } from "../../lib/todos/date";
import {
  TODO_FREQUENCY_LABELS,
  frequencyToNaturalLanguage,
} from "../../lib/todos/recurrence";
import type { TodoFrequency, TodoRecurringSeries } from "../../lib/todos/types";
import { useTodosContext } from "./TodosContext";

const FREQUENCIES = Object.keys(TODO_FREQUENCY_LABELS) as TodoFrequency[];

interface TodoRecurringSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TodoRecurringSheet({
  open,
  onOpenChange,
}: TodoRecurringSheetProps) {
  const { recurringSeries, createTask } = useTodosContext();
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<TodoFrequency>("daily");
  const [startDate, setStartDate] = useState(todayISO());

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    await createTask({
      title: `${trimmed} ${frequencyToNaturalLanguage(frequency)}`,
      dueDate: startDate,
    });
    setTitle("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Recurring</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
          <form
            className="border-border grid gap-2 border p-3 sm:grid-cols-[1fr_auto_auto_auto]"
            onSubmit={handleSubmit}>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="To-do"
            />
            <Select
              value={frequency}
              onValueChange={(value) => setFrequency(value as TodoFrequency)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((entry) => (
                  <SelectItem key={entry} value={entry}>
                    {TODO_FREQUENCY_LABELS[entry]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="sm:w-36"
            />
            <Button
              type="submit"
              disabled={title.trim().length === 0}
              aria-label="Create recurring to-do">
              <PlusIcon />
              Add
            </Button>
          </form>

          <div className="border-border flex flex-col border">
            {recurringSeries.length === 0 ? (
              <p className="text-muted-foreground px-3 py-6 text-center text-xs">
                No recurring to-dos
              </p>
            ) : (
              recurringSeries.map((series) => (
                <RecurringSeriesRow key={series.id} series={series} />
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RecurringSeriesRow({ series }: { series: TodoRecurringSeries }) {
  const { updateRecurringTodo, deleteRecurringTodo } = useTodosContext();
  const [title, setTitle] = useState(series.title);
  const [frequency, setFrequency] = useState<TodoFrequency>(series.frequency);
  const [startDate, setStartDate] = useState(series.startDate);
  const dirty =
    title !== series.title ||
    frequency !== series.frequency ||
    startDate !== series.startDate;

  const save = async () => {
    if (!title.trim()) return;
    await updateRecurringTodo(series.id, {
      title,
      frequency,
      startDate,
    });
  };

  return (
    <div className="border-border grid gap-2 border-b p-3 last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto]">
      <Input value={title} onChange={(event) => setTitle(event.target.value)} />
      <Select
        value={frequency}
        onValueChange={(value) => setFrequency(value as TodoFrequency)}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FREQUENCIES.map((entry) => (
            <SelectItem key={entry} value={entry}>
              {TODO_FREQUENCY_LABELS[entry]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
        className="sm:w-36"
      />
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!dirty || title.trim().length === 0}
          onClick={save}>
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => void deleteRecurringTodo(series.id)}
          aria-label="Delete recurring to-do">
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
}
