import { useMemo, useState } from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@juan/ui/components/ui/hover-card";

interface Props {
  text: string;
  children?: React.ReactNode | string;
}

interface PointerPosition {
  x: number;
  y: number;
}

export const HomePageHoverCard = ({ text, children }: Props) => {
  const [pointerPosition, setPointerPosition] = useState<PointerPosition>({
    x: 0,
    y: 0,
  });

  const anchor = useMemo(
    () => ({
      getBoundingClientRect: () => ({
        x: pointerPosition.x,
        y: pointerPosition.y,
        top: pointerPosition.y,
        right: pointerPosition.x,
        bottom: pointerPosition.y,
        left: pointerPosition.x,
        width: 0,
        height: 0,
        toJSON: () => ({}),
      }),
    }),
    [pointerPosition],
  );

  const updatePointerPosition = (event: React.PointerEvent<HTMLElement>) => {
    setPointerPosition({ x: event.clientX, y: event.clientY });
  };

  const updatePositionFromTrigger = (event: React.FocusEvent<HTMLElement>) => {
    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();

    setPointerPosition({
      x: left + width / 2,
      y: top + height / 2,
    });
  };

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={0}
        closeDelay={100}
        onFocus={updatePositionFromTrigger}
        onPointerDown={updatePointerPosition}
        onPointerEnter={updatePointerPosition}
        onPointerMove={updatePointerPosition}
        render={
          <button
            type="button"
            className="decoration-foreground/60 hover:decoration-foreground focus-visible:ring-ring font-inherit leading-inherit inline bg-transparent p-0 text-inherit underline decoration-dashed underline-offset-1 outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
            {text}
          </button>
        }
      />
      <HoverCardContent
        anchor={anchor}
        positionMethod="fixed"
        side="bottom"
        align="start"
        alignOffset={0}
        sideOffset={10}
        className="w-64 overflow-hidden p-0 [&>video]:block [&>video]:w-full">
        {children}
      </HoverCardContent>
    </HoverCard>
  );
};
