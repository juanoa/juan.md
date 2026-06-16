import {
  HeadContent,
  Navigate,
  Outlet,
  createRootRoute,
  useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";

import {
  AuthContextProvider,
  useAuthContext,
} from "../components/auth/AuthContext";
import { GymContextProvider } from "../components/gym/GymContext";
import { TodosContextProvider } from "../components/todos/TodosContext";

export const Route = createRootRoute({
  component: RootLayout,
  head: () => ({
    meta: [
      {
        title: "App",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
      },
    ],
  }),
});

function RootLayout() {
  return (
    <>
      <HeadContent />
      <AuthContextProvider>
        <RequireAuth>
          <Outlet />
        </RequireAuth>
        <TanStackRouterDevtools position="bottom-right" />
      </AuthContextProvider>
    </>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuthContext();
  const location = useLocation();
  const isPublic =
    location.pathname === "/login" || location.pathname.startsWith("/auth/");

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    if (isPublic) return <>{children}</>;
    return <Navigate to="/login" replace />;
  }

  if (isPublic) {
    return <Navigate to="/" replace />;
  }

  return (
    <GymContextProvider>
      <TodosContextProvider>{children}</TodosContextProvider>
    </GymContextProvider>
  );
}
