import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarBlankIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRef, type CSSProperties, type PointerEvent } from "react";

import { cn } from "@juan/ui/lib/utils";

import {
  dayLabel,
  dayNumberLabel,
  formatAccessibleISODate,
} from "../../lib/gym/date";
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
  const accessibleDate = formatAccessibleISODate(isoDate);

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
          {dayNumberLabel(date)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        {sessions.map((session) => (
          <DraggableSessionPill key={session.id} session={session} />
        ))}
        <Link
          to="/gym/new"
          search={{ date: isoDate }}
          aria-label={`Plan a session on ${accessibleDate}`}
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
  const navigate = useNavigate();
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const didMovePointerRef = useRef(false);

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const handlePointerDownCapture = (event: PointerEvent<HTMLButtonElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    didMovePointerRef.current = false;
  };

  const handlePointerMoveCapture = (event: PointerEvent<HTMLButtonElement>) => {
    const start = pointerStartRef.current;
    if (!start) return;

    const distance = Math.hypot(
      event.clientX - start.x,
      event.clientY - start.y,
    );
    if (distance > 4) {
      didMovePointerRef.current = true;
    }
  };

  const handleViewSession = () => {
    if (didMovePointerRef.current) {
      didMovePointerRef.current = false;
      return;
    }

    void navigate({
      to: "/gym/$sessionId",
      params: { sessionId: session.id },
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        ref={setNodeRef}
        style={style}
        type="button"
        onPointerDownCapture={handlePointerDownCapture}
        onPointerMoveCapture={handlePointerMoveCapture}
        className={cn(
          "ring-foreground/15 hover:bg-muted/60 bg-background flex cursor-grab flex-col items-start gap-0.5 px-2 py-1.5 text-left text-xs ring-1 active:cursor-grabbing",
          isDragging && "cursor-grabbing",
        )}
        {...listeners}
        {...attributes}
        onClick={handleViewSession}>
        <span className="text-foreground font-medium capitalize">
          {session.subcategory}
        </span>
        <span className="text-muted-foreground flex items-center gap-1.5">
          <span>{session.exercises.length} exercises</span>
          <SessionStatusIcon status={session.status} />
        </span>
      </button>
    </div>
  );
}

function SessionStatusIcon({ status }: { status: Session["status"] }) {
  const Icon =
    status === "completed"
      ? CheckCircleIcon
      : status === "in_progress"
        ? PlayCircleIcon
        : CalendarBlankIcon;
  const label = status.replace("_", " ");

  return (
    <span
      className={cn(
        "inline-flex items-center",
        status === "completed" ? "text-success" : "text-muted-foreground",
      )}>
      <Icon
        className="size-3.5"
        weight={status === "completed" ? "fill" : "regular"}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
