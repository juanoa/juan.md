import { Link } from "@tanstack/react-router";

import { DashboardCell } from "../dashboard";
import { CAION_SURF_CAMERA, SurfCameraCard } from "./surf-camera-grid";

export function CaionSurfCameraCell() {
  return (
    <DashboardCell
      title="Caion surf camera"
      link={
        <Link
          to="/surf-cameras"
          className="text-muted-foreground hover:text-foreground text-xs">
          All the cameras
        </Link>
      }>
      <SurfCameraCard
        className="flex-1"
        showTitle={false}
        title={CAION_SURF_CAMERA.title}
        streamUrl={CAION_SURF_CAMERA.streamUrl}
      />
    </DashboardCell>
  );
}
