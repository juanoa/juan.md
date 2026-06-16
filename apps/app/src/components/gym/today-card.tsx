import {
  BarbellIcon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { Badge } from "@juan/ui/components/ui/badge";
import { Button } from "@juan/ui/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";

import { todayISO } from "../../lib/gym/date";
import { useGymContext } from "./GymContext";
import { SessionSummary } from "./session-summary";

export function TodayCard() {
  const { getSessionsByDate } = useGymContext();
  const todayIso = todayISO();
  const todaySessions = getSessionsByDate(todayIso);

  if (todaySessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No session today</CardTitle>
          <CardDescription>
            Drag a session onto today, or plan a new one.
          </CardDescription>
          <CardAction>
            <Button asChild size="sm">
              <Link to="/gym/new" search={{ date: todayIso }}>
                <PlusIcon /> New session
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="pt-0">
      <div className="flex flex-col gap-(--card-spacing) lg:flex-row">
        <div className="bg-muted text-muted-foreground flex h-24 w-full items-center justify-center lg:h-auto lg:w-40 lg:self-stretch">
          <BarbellIcon className="size-10 sm:size-12" />
        </div>
        <div className="flex flex-1 flex-col gap-(--card-spacing) pt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <span>Gym</span>
              <span className="text-muted-foreground">
                {todaySessions.length} session
                {todaySessions.length === 1 ? "" : "s"} today
              </span>
            </CardTitle>
            <CardAction>
              <Button asChild size="sm" variant="outline">
                <Link to="/gym/new" search={{ date: todayIso }}>
                  <PlusIcon /> Add session
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {todaySessions.map((session) => (
              <div
                key={session.id}
                className="ring-foreground/10 flex flex-col gap-3 p-3 ring-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium capitalize">
                        {session.subcategory}
                      </span>
                      {session.status === "completed" ? (
                        <Badge variant="success">Completed</Badge>
                      ) : (
                        <Badge variant="secondary">
                          {session.status.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                    <Link
                      to="/gym/$sessionId"
                      params={{ sessionId: session.id }}
                      className="text-muted-foreground hover:text-foreground text-xs">
                      View details
                    </Link>
                  </div>
                  <Button asChild size="sm">
                    <Link
                      to="/gym/$sessionId/run"
                      params={{ sessionId: session.id }}>
                      {session.status === "planned" ? (
                        <>
                          <PlayIcon /> Start
                        </>
                      ) : session.status === "in_progress" ? (
                        <>
                          <PlayIcon /> Continue
                        </>
                      ) : (
                        <>
                          <PencilIcon /> Edit
                        </>
                      )}
                    </Link>
                  </Button>
                </div>
                <SessionSummary exercises={session.exercises} />
              </div>
            ))}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
