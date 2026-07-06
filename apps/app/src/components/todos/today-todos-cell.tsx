import { PlusIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { Checkbox } from "@juan/ui/components/ui/checkbox";

import { DashboardCell } from "../dashboard";
import { MarkdownText } from "./markdown";
import { useTodosContext } from "./TodosContext";

export function TodayTodosCell() {
  const { getTasksForDate, status, today, toggleTask } = useTodosContext();
  const todayTasks = getTasksForDate(today);
  const openTasks = todayTasks.filter((task) => task.completedAt === null);

  return (
    <DashboardCell
      title="To-dos"
      link={
        <Link
          to="/to-dos"
          className="text-muted-foreground hover:text-foreground text-xs">
          Open
        </Link>
      }>
      <div className="border-border bg-card flex flex-1 flex-col border">
        {openTasks.length > 0 ? (
          <ul className="flex flex-1 flex-col">
            {openTasks.map((task) => {
              const displayTitle = task.title.startsWith("- ")
                ? task.title.slice(2)
                : task.title;

              return (
                <li
                  key={task.id}
                  className="border-border flex items-start gap-2 border-b px-3 py-2 text-xs last:border-b-0 md:last:border-b">
                  <Checkbox
                    checked={false}
                    onCheckedChange={(checked) => {
                      if (checked === true) toggleTask(task.id, true);
                    }}
                    aria-label="Mark to-do complete"
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1 leading-5 break-words">
                    <MarkdownText value={displayTitle} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Link
            to="/to-dos"
            className="text-muted-foreground hover:text-foreground flex flex-1 items-center justify-center gap-2 px-8 py-16 text-sm transition-colors">
            <PlusIcon className="size-3" />
            {status === "loading" ? "Loading to-dos" : "No open to-dos today"}
          </Link>
        )}
      </div>
    </DashboardCell>
  );
}
