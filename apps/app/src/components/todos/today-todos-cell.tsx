import { ListChecksIcon, PlusIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { todayISO } from "../../lib/todos/date";
import { DashboardCell } from "../dashboard";
import { useTodosContext } from "./TodosContext";

export function TodayTodosCell() {
  const { getTasksForDate } = useTodosContext();
  const todayTasks = getTasksForDate(todayISO());
  const openTasks = todayTasks.filter((task) => task.completedAt === null);
  const completedTasks = todayTasks.length - openTasks.length;

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
      <Link
        to="/to-dos"
        className="border-border bg-card hover:bg-muted/40 flex flex-1 flex-col justify-between border p-4 transition-colors">
        <div className="flex items-center justify-between">
          <ListChecksIcon className="text-muted-foreground size-5" />
          <span className="text-muted-foreground text-xs">
            {completedTasks} done
          </span>
        </div>
        <div className="mt-8">
          <p className="text-3xl font-medium tabular-nums">
            {openTasks.length}
          </p>
          <p className="text-muted-foreground text-sm">open today</p>
        </div>
        {todayTasks.length === 0 && (
          <span className="text-muted-foreground mt-6 inline-flex items-center gap-1 text-xs">
            <PlusIcon className="size-3" />
            Add first to-do
          </span>
        )}
      </Link>
    </DashboardCell>
  );
}
