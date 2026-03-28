"use client";

import * as React from "react";

import { Button } from "@juan/ui/components/ui/button";
import { Input } from "@juan/ui/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@juan/ui/components/ui/select";

const ROLE_OPTIONS = [
  "Software Engineer",
  "Product Designer",
  "Product Manager",
  "C-Level",
] as const;

type Role = (typeof ROLE_OPTIONS)[number];
type SubmitState = "idle" | "submitting" | "success" | "error";

export function NewsletterSignupForm() {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<Role | "">("");
  const [submitState, setSubmitState] = React.useState<SubmitState>("idle");
  const [message, setMessage] = React.useState("");
  const statusId = React.useId();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !role) {
      setSubmitState("error");
      setMessage("Enter an email and pick a role.");
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
        body: JSON.stringify({ email, role }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "Something went wrong.");
      }

      setSubmitState("success");
      setMessage(payload.message ?? "You are subscribed.");
      setEmail("");
      setRole("");
      return;
    } catch (error) {
      setSubmitState("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
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

      <Button
        type="submit"
        className="w-full"
        disabled={submitState === "submitting"}>
        {submitState === "submitting" ? "Subscribing..." : "Subscribe"}
      </Button>

      <p
        id={statusId}
        aria-live="polite"
        className="text-muted-foreground min-h-5 text-xs">
        {message}
      </p>
    </form>
  );
}
