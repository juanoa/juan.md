import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/gym/exercises")({
  component: ExercisesLayout,
});

function ExercisesLayout() {
  return <Outlet />;
}
