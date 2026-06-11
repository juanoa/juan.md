import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { GymContextProvider } from "../components/gym/GymContext";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <GymContextProvider>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </GymContextProvider>
  );
}
