import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { PlayIcon, PlusIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";

import { cn } from "@juan/ui/lib/utils";

import { dayLabel } from "../../lib/gym/date";
import type { Session } from "../../lib/gym/types";

interface DayCardProps {
  date: Date;
  isoDate: string;
  isToday: boolean;
  sessions: Session[];
}

function dayDroppableId(isoDate: string): string {
  return `day-${isoDate}`;
}

export function DayCard({ date, isoDate, isToday, sessions }: DayCardProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dayDroppableId(isoDate),
  });

  return (
    <div
      ref={setDropRef}
      className={cn(
        "ring-foreground/10 bg-card flex min-h-32 flex-col gap-2 p-2 text-xs ring-1 transition-colors",
        isOver && "ring-primary bg-muted ring-2",
      )}>
      <div className="flex items-baseline justify-between">
        <span className="text-foreground font-medium">{dayLabel(date)}</span>
        <span
          className={cn(
            "text-muted-foreground tabular-nums",
            isToday && "text-primary font-medium",
          )}>
          {date.getDate()}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        {sessions.map((session) => (
          <DraggableSessionPill key={session.id} session={session} />
        ))}
        <Link
          to="/gym/new"
          search={{ date: isoDate }}
          aria-label={`Plan a session on ${isoDate}`}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 ring-foreground/10 ring-dashed flex min-h-10 flex-1 items-center justify-center gap-1 ring-1 transition-colors">
          <PlusIcon className="size-3" />
        </Link>
      </div>
    </div>
  );
}

interface DraggableSessionPillProps {
  session: Session;
}

function DraggableSessionPill({ session }: DraggableSessionPillProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: session.id });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        ref={setNodeRef}
        style={style}
        type="button"
        className={cn(
          "ring-foreground/15 hover:bg-muted/60 bg-background flex cursor-grab flex-col items-start gap-0.5 px-2 py-1.5 text-left text-xs ring-1 active:cursor-grabbing",
          isDragging && "cursor-grabbing",
        )}
        {...listeners}
        {...attributes}>
        <span className="text-foreground font-medium capitalize">
          {session.subcategory}
        </span>
        <span className="text-muted-foreground">
          {session.exercises.length} exercises ·{" "}
          {session.status.replace("_", " ")}
        </span>
      </button>
      <div className="flex items-center gap-2">
        <Link
          to="/gym/$sessionId"
          params={{ sessionId: session.id }}
          className="text-muted-foreground hover:text-foreground text-[10px]">
          Open
        </Link>
        {session.status !== "completed" && (
          <Link
            to="/gym/$sessionId/run"
            params={{ sessionId: session.id }}
            className="text-muted-foreground hover:text-foreground flex items-center gap-0.5 text-[10px]">
            <PlayIcon className="size-2.5" /> Run
          </Link>
        )}
      </div>
    </div>
  );
}
