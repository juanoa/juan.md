import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "../components/dashboard";
import { TodoBoard } from "../components/todos/todo-board";

const PAGE_NAME = "To-dos";

export const Route = createFileRoute("/to-dos")({
  component: TodosRoute,
  head: () => ({
    meta: [
      {
        title: PAGE_NAME,
      },
    ],
  }),
});

function TodosRoute() {
  return (
    <Dashboard title={PAGE_NAME}>
      <TodoBoard />
    </Dashboard>
  );
}
