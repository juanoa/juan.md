import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "../components/dashboard";
import { ManageExercises } from "../components/gym/manage-exercises";

const PAGE_NAME = "Manage exercises";

export const Route = createFileRoute("/gym/exercises/")({
  component: ManageExercisesRoute,
  head: () => ({
    meta: [
      {
        title: PAGE_NAME,
      },
    ],
  }),
});

function ManageExercisesRoute() {
  return (
    <Dashboard title={PAGE_NAME}>
      <ManageExercises />
    </Dashboard>
  );
}
