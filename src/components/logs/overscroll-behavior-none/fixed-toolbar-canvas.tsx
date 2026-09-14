import { CursorIcon, HandIcon } from "@phosphor-icons/react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Tool = "mouse" | "hand";
type Point = { x: number; y: number };
type Size = { width: number; height: number };

const GRID_SIZE = 32;
const tools: { label: string; value: Tool; icon: typeof CursorIcon }[] = [
  { label: "Mouse", value: "mouse", icon: CursorIcon },
  { label: "Hand", value: "hand", icon: HandIcon },
];

type FixedToolbarCanvasProps = {
  disableAsideOverscroll?: boolean;
};

export const FixedToolbarCanvas = ({
  disableAsideOverscroll = false,
}: FixedToolbarCanvasProps) => {
  const [activeTool, setActiveTool] = useState<Tool>("hand");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState<Size>({
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const dragStartRef = useRef<{
    pointerId: number;
    pointerX: number;
    pointerY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => {
      setIsDarkMode(mediaQuery.matches);
    };

    syncTheme();
    mediaQuery.addEventListener("change", syncTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncTheme);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    const updateViewportSize = () => {
      const rect = viewport.getBoundingClientRect();

      setViewportSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setOffset((current) => ({
        x: current.x - event.deltaX,
        y: current.y - event.deltaY,
      }));
    };

    const resizeObserver = new ResizeObserver(() => {
      updateViewportSize();
    });

    updateViewportSize();
    resizeObserver.observe(viewport);
    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    if (!disableAsideOverscroll) return;

    const aside = asideRef.current;

    if (!aside) return;

    const stopAsideOverscroll = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    aside.addEventListener("wheel", stopAsideOverscroll, {
      capture: true,
      passive: false,
    });

    return () => {
      aside.removeEventListener("wheel", stopAsideOverscroll, true);
    };
  }, [disableAsideOverscroll]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || viewportSize.width === 0 || viewportSize.height === 0)
      return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewportSize.width * dpr);
    canvas.height = Math.floor(viewportSize.height * dpr);
    canvas.style.width = `${viewportSize.width}px`;
    canvas.style.height = `${viewportSize.height}px`;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, viewportSize.width, viewportSize.height);
    context.fillStyle = isDarkMode ? "#09090b" : "#f9fafb";
    context.fillRect(0, 0, viewportSize.width, viewportSize.height);

    const startX = ((offset.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
    const startY = ((offset.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;

    context.beginPath();
    context.strokeStyle = isDarkMode
      ? "rgba(82, 82, 91, 0.9)"
      : "rgba(209, 213, 219, 0.9)";
    context.lineWidth = 1;

    for (let x = startX; x <= viewportSize.width; x += GRID_SIZE) {
      context.moveTo(x, 0);
      context.lineTo(x, viewportSize.height);
    }

    for (let y = startY; y <= viewportSize.height; y += GRID_SIZE) {
      context.moveTo(0, y);
      context.lineTo(viewportSize.width, y);
    }

    context.stroke();
  }, [isDarkMode, offset.x, offset.y, viewportSize.height, viewportSize.width]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activeTool !== "hand") return;

    event.preventDefault();

    dragStartRef.current = {
      pointerId: event.pointerId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;

    if (!dragStart || dragStart.pointerId !== event.pointerId) return;

    event.preventDefault();

    setOffset({
      x: dragStart.offsetX + event.clientX - dragStart.pointerX,
      y: dragStart.offsetY + event.clientY - dragStart.pointerY,
    });
  };

  const finishDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;

    if (!dragStart || dragStart.pointerId !== event.pointerId) return;

    dragStartRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
  };
  return (
    <div className="space-y-3">
      <div className="relative h-[380px] overflow-hidden rounded border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div
          ref={viewportRef}
          className={[
            "h-full w-full touch-none overscroll-none bg-zinc-50 select-none dark:bg-zinc-950",
            activeTool === "hand"
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default",
          ].join(" ")}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDragging}
          onPointerCancel={finishDragging}
          aria-label="Infinite canvas">
          <canvas ref={canvasRef} className="block h-full w-full" />
        </div>

        <aside
          ref={asideRef}
          className={[
            "absolute top-1/2 left-3 z-10 h-fit w-fit -translate-y-1/2 rounded border border-zinc-300 bg-zinc-200 p-2 select-none dark:border-zinc-700 dark:bg-zinc-800",
            disableAsideOverscroll ? "touch-none overscroll-none" : "",
          ].join(" ")}
          style={{
            overscrollBehavior: disableAsideOverscroll ? "none" : undefined,
          }}>
          <div className="flex flex-col gap-2">
            {tools.map((tool) => {
              const isActive = tool.value === activeTool;
              const Icon = tool.icon;

              return (
                <button
                  key={tool.value}
                  type="button"
                  onClick={() => setActiveTool(tool.value)}
                  className={[
                    "rounded border p-3 text-xs transition-colors",
                    isActive
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
                  ].join(" ")}
                  aria-label={tool.label}>
                  <Icon size={20} />
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {disableAsideOverscroll ? (
        <p className="mx-3 text-center text-xs text-zinc-500 italic dark:text-zinc-400">
          With a trackpad: pan over the canvas or over the left toolbar. It
          works as expected.
        </p>
      ) : (
        <p className="mx-3 text-center text-xs text-zinc-500 italic dark:text-zinc-400">
          With a trackpad: pan over the canvas. It works as expected. But when
          you pan over the left toolbar, default browser behavior kicks in,
          frustrating users.
        </p>
      )}
    </div>
  );
};
