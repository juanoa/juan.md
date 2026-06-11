import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/gym")({
  component: GymLayout,
});

function GymLayout() {
  return <Outlet />;
}
