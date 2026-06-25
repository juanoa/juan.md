import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "../components/dashboard";
import { ExerciseDetail } from "../components/gym/exercise-detail";

const PAGE_NAME = "Exercise";

export const Route = createFileRoute("/gym/exercises/$exerciseId")({
  component: ExerciseRoute,
  head: () => ({
    meta: [
      {
        title: PAGE_NAME,
      },
    ],
  }),
});

function ExerciseRoute() {
  const { exerciseId } = Route.useParams();

  return (
    <Dashboard title={PAGE_NAME}>
      <ExerciseDetail exerciseId={exerciseId} />
    </Dashboard>
  );
}
