import { useEffect, useMemo, useRef, useState } from "react";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Props {
  text: string;
  children?: React.ReactNode | string;
}

interface PointerPosition {
  x: number;
  y: number;
}

const MOBILE_MEDIA_QUERY =
  "(max-width: 639px), (hover: none) and (pointer: coarse)";

const isMobileViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia(MOBILE_MEDIA_QUERY).matches;

export const HomePageHoverCard = ({ text, children }: Props) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isTouchTriggerRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(isMobileViewport);
  const [isTouchTrigger, setIsTouchTrigger] = useState(false);
  const [pointerPosition, setPointerPosition] = useState<PointerPosition>({
    x: 0,
    y: 0,
  });

  const pointerAnchor = useMemo(
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

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  const updatePointerPosition = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || isMobileViewport()) {
      isTouchTriggerRef.current = true;
      setIsTouchTrigger(true);
      return;
    }

    isTouchTriggerRef.current = false;
    setIsTouchTrigger(false);
    setPointerPosition({ x: event.clientX, y: event.clientY });
  };

  const activateTriggerAnchor = () => {
    isTouchTriggerRef.current = true;
    setIsTouchTrigger(true);
  };

  const prepareTouchTrigger = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && !isMobileViewport()) {
      updatePointerPosition(event);
      return;
    }

    activateTriggerAnchor();
  };

  const openFromTouch = () => {
    const mobileViewport = isMobileViewport();

    if (mobileViewport || isTouchTriggerRef.current) {
      setIsMobile(mobileViewport);
      activateTriggerAnchor();
      setOpen(true);
    }
  };

  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger
        delay={0}
        closeDelay={100}
        onClick={openFromTouch}
        onFocus={activateTriggerAnchor}
        onPointerDown={prepareTouchTrigger}
        onPointerEnter={updatePointerPosition}
        onPointerMove={updatePointerPosition}
        render={
          <button
            ref={triggerRef}
            type="button"
            className="decoration-foreground/60 hover:decoration-foreground focus-visible:ring-ring font-inherit leading-inherit inline bg-transparent p-0 text-inherit underline decoration-dashed underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {text}
          </button>
        }
      />
      <HoverCardContent
        anchor={isMobile || isTouchTrigger ? triggerRef : pointerAnchor}
        positionMethod="fixed"
        side="bottom"
        align={isMobile || isTouchTrigger ? "center" : "start"}
        alignOffset={0}
        sideOffset={10}
        className="w-64 overflow-hidden p-0 [&>video]:block [&>video]:w-full"
      >
        {children}
      </HoverCardContent>
    </HoverCard>
  );
};
