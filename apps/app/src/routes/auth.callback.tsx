import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { useAuthContext } from "../components/auth/AuthContext";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackRoute,
});

function AuthCallbackRoute() {
  const { status } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "loading") return;
    navigate({ to: status === "authenticated" ? "/" : "/login", replace: true });
  }, [status, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Signing you in...</p>
    </div>
  );
}
