"use client";

import * as React from "react";

import { Turnstile, type BoundTurnstileObject } from "react-turnstile";

import { Button } from "@juan/ui/components/ui/button";
import { Input } from "@juan/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@juan/ui/components/ui/select";

import { CheckCircleIcon } from "@juan/ui/icons/phosphor";

const ROLE_OPTIONS = [
  "Software Engineer",
  "Product Designer",
  "Product Manager",
  "C-Level",
] as const;

type Role = (typeof ROLE_OPTIONS)[number];
type SubmitState = "idle" | "submitting" | "success" | "error";

const TURNSTILE_REQUIRED_MESSAGE =
  "Complete the verification before subscribing.";
const TURNSTILE_ERROR_MESSAGE = "Verification failed. Try again.";
const TURNSTILE_UNAVAILABLE_MESSAGE =
  "Verification is unavailable right now. Try again later.";

export function NewsletterSignupForm() {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role | "">("");
  const [turnstileToken, setTurnstileToken] = React.useState("");
  const [submitState, setSubmitState] = React.useState<SubmitState>("idle");
  const [message, setMessage] = React.useState("");
  const turnstileRef = React.useRef<BoundTurnstileObject | null>(null);
  const statusId = React.useId();
  const turnstileSiteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY;
  const isSubmitDisabled =
    submitState === "submitting" || !turnstileSiteKey || !turnstileToken;

  function resetTurnstile() {
    setTurnstileToken("");
    turnstileRef.current?.reset();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !role) {
      setSubmitState("error");
      setMessage("Enter an email and pick a role.");
      return;
    }

    if (!turnstileSiteKey) {
      setSubmitState("error");
      setMessage(TURNSTILE_UNAVAILABLE_MESSAGE);
      return;
    }

    if (!turnstileToken) {
      setSubmitState("error");
      setMessage(TURNSTILE_REQUIRED_MESSAGE);
      return;
    }

    setSubmitState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role, turnstileToken }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        resetTurnstile();
        throw new Error(payload.message ?? "Something went wrong.");
      }

      setSubmitState("success");
      setMessage(payload.message ?? "You are subscribed.");
      setEmail("");
      setRole("");
      resetTurnstile();
      return;
    } catch (error) {
      setSubmitState("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  if (submitState === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10">
        <CheckCircleIcon className="size-7 text-green-600" />
        <p>Thanks for subscribing</p>
        <p className="text-muted-foreground text-sm">See you tomorrow!</p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="newsletter-email">
          Email
        </label>
        <Input
          id="newsletter-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="email@provider.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={submitState === "submitting"}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="newsletter-role">
          Role
        </label>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as Role)}
          disabled={submitState === "submitting"}>
          <SelectTrigger
            id="newsletter-role"
            className="w-full"
            aria-label="Select your role">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {turnstileSiteKey ? (
        <Turnstile
          sitekey={turnstileSiteKey}
          fixedSize
          responseField={false}
          refreshExpired="auto"
          size="flexible"
          onLoad={(_, boundTurnstile) => {
            turnstileRef.current = boundTurnstile;
          }}
          onVerify={(token, boundTurnstile) => {
            turnstileRef.current = boundTurnstile;
            setTurnstileToken(token);
            setSubmitState((current) =>
              current === "error" ? "idle" : current,
            );
            setMessage((current) =>
              current === TURNSTILE_REQUIRED_MESSAGE ||
              current === TURNSTILE_ERROR_MESSAGE
                ? ""
                : current,
            );
          }}
          onExpire={(_, boundTurnstile) => {
            turnstileRef.current = boundTurnstile;
            setTurnstileToken("");
          }}
          onError={(_, boundTurnstile) => {
            turnstileRef.current = boundTurnstile ?? turnstileRef.current;
            setTurnstileToken("");
            setSubmitState("error");
            setMessage(TURNSTILE_ERROR_MESSAGE);
          }}
        />
      ) : (
        <p className="text-sm">{TURNSTILE_UNAVAILABLE_MESSAGE}</p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
        {submitState === "submitting" ? "Subscribing..." : "Subscribe"}
      </Button>

      <p id={statusId} aria-live="polite" className="min-h-5 text-xs">
        {message}
      </p>
    </form>
  );
}
