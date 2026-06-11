import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@juan/ui/components/ui/button";

import { useAuthContext } from "../components/auth/AuthContext";

export const Route = createFileRoute("/login")({
  component: LoginRoute,
});

function LoginRoute() {
  const { signInWithGoogle } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-medium">Sign in</h1>
          <p className="text-muted-foreground text-sm">
            Continue with your Google account.
          </p>
        </div>
        <Button onClick={handleSignIn} disabled={loading}>
          {loading ? "Redirecting..." : "Continue with Google"}
        </Button>
        {error ? (
          <p className="text-destructive text-xs">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
