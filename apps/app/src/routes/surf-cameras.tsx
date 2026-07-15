import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "../components/dashboard";
import { SurfCameraGrid } from "../components/sports/surf-camera-grid";

const PAGE_NAME = "Surf cameras";

export const Route = createFileRoute("/surf-cameras")({
  component: SurfCamerasRoute,
  head: () => ({
    meta: [{ title: PAGE_NAME }],
  }),
});

function SurfCamerasRoute() {
  return (
    <Dashboard title={PAGE_NAME}>
      <SurfCameraGrid />
    </Dashboard>
  );
}
