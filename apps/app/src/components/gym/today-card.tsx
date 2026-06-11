import { BarbellIcon, PlayIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { Button } from "@juan/ui/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";

import { todayISO } from "../../lib/gym/date";
import { useGymContext } from "./GymContext";
import { SessionSummary } from "./session-summary";

export function TodayCard() {
  const { getSessionByDate } = useGymContext();
  const today = getSessionByDate(todayISO());

  if (!today) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No session today</CardTitle>
          <CardDescription>
            Drag a session onto today, or rest up.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="pt-0">
      <div className="flex flex-col gap-(--card-spacing) sm:flex-row">
        <div className="bg-muted text-muted-foreground flex h-24 w-full items-center justify-center sm:h-auto sm:w-40 sm:self-stretch">
          <BarbellIcon className="size-10 sm:size-12" />
        </div>
        <div className="flex flex-1 flex-col gap-(--card-spacing) pt-6">
          <CardHeader>
            <CardTitle className="text-base">
              Gym{" "}
              <span className="text-muted-foreground capitalize">
                {today.subcategory}
              </span>
            </CardTitle>
            <CardAction>
              <Button asChild size="sm">
                <Link
                  to="/gym/$sessionId/run"
                  params={{ sessionId: today.id }}
                >
                  <PlayIcon /> Start session
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <SessionSummary exercises={today.exercises} />
          </CardContent>
          <CardFooter>
            <Link
              to="/gym/$sessionId"
              params={{ sessionId: today.id }}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              View details
            </Link>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
