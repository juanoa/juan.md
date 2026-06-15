import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@juan/ui/components/ui/button";

import { Dashboard } from "../components/dashboard";
import { NewSessionForm } from "../components/gym/new-session-form";
import type { GymSubcategory } from "../lib/gym/types";

const SUBCATEGORY_SLUGS: GymSubcategory[] = [
  "back",
  "chest",
  "legs",
  "shoulders",
  "arms",
  "core",
  "full-body",
];

interface NewSessionSearch {
  date?: string;
  subcategory?: GymSubcategory;
}

export const Route = createFileRoute("/gym/new")({
  validateSearch: (input: Record<string, unknown>): NewSessionSearch => {
    const date =
      typeof input.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.date)
        ? input.date
        : undefined;
    const subcategory =
      typeof input.subcategory === "string" &&
      (SUBCATEGORY_SLUGS as string[]).includes(input.subcategory)
        ? (input.subcategory as GymSubcategory)
        : undefined;
    return { date, subcategory };
  },
  component: GymNewSessionRoute,
});

function GymNewSessionRoute() {
  const { date, subcategory } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <Dashboard title="Gym - New session">
      <div className="flex items-start justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/gym">
            <ArrowLeftIcon /> Back
          </Link>
        </Button>
      </div>
      <NewSessionForm
        initialDate={date}
        initialSubcategory={subcategory}
        onCreated={(sessionId) =>
          navigate({ to: "/gym/$sessionId", params: { sessionId } })
        }
        onCancel={() => navigate({ to: "/gym" })}
      />
    </Dashboard>
  );
}
