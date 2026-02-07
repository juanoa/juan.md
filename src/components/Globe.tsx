import React, { useEffect, useMemo, useRef, useState } from "react";
import { geoDistance, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Feature, Geometry } from "geojson";

const WORLD_TOPOJSON =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const A_CORUNA = {
  coordinates: [-8.408, 43.362] as [number, number],
};

const DRAG_SENSITIVITY = 0.02;
const UNLOCK_DURATION = 1200;

const easeInOut = (t: number) => t * t * (3 - 2 * t);

type Rotation = [number, number, number];
type TopologyArg = Parameters<typeof feature>[0];
type GeometryCollectionArg = Extract<
  Parameters<typeof feature>[1],
  { type: "GeometryCollection" }
>;
type WorldAtlasTopology = TopologyArg & {
  objects: {
    countries: GeometryCollectionArg;
  };
};

type DragState = {
  startX: number;
  startY: number;
  startRotation: Rotation;
} | null;

const Globe = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dragStateRef = useRef<DragState>(null);
  const rotationRef = useRef<Rotation>([0, 0, 0]);
  const scaleRef = useRef(1);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [countries, setCountries] = useState<Feature<Geometry>[]>([]);
  const [rotation, setRotation] = useState<Rotation>([0, 0, 0]);
  const [scale, setScale] = useState(1);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const baseScale = useMemo(() => {
    if (!dimensions.width || !dimensions.height) return 1;
    return Math.min(dimensions.width, dimensions.height) / 2.1;
  }, [dimensions.height, dimensions.width]);

  const focusScale = baseScale * 7;

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setDimensions({
        width: Math.max(1, entry.contentRect.width),
        height: Math.max(1, entry.contentRect.height),
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch(WORLD_TOPOJSON)
      .then((response) => response.json() as Promise<WorldAtlasTopology>)
      .then((topology) => {
        if (!isMounted) return;
        const collection = feature(
          topology,
          topology.objects.countries,
        );
        if ("features" in collection) {
          setCountries(collection.features as Feature<Geometry>[]);
        } else {
          setCountries([]);
        }
      })
      .catch(() => {
        setCountries([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const runAnimation = (
    fromRotation: Rotation,
    toRotation: Rotation,
    fromScale: number,
    toScale: number,
    duration: number,
  ) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = easeInOut(progress);
      const nextRotation: Rotation = [
        fromRotation[0] + (toRotation[0] - fromRotation[0]) * eased,
        fromRotation[1] + (toRotation[1] - fromRotation[1]) * eased,
        0,
      ];
      const nextScale = fromScale + (toScale - fromScale) * eased;
      setRotation(nextRotation);
      setScale(nextScale);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!countries.length || !dimensions.width || !dimensions.height) return;
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const targetRotation: Rotation = [
      -A_CORUNA.coordinates[0],
      -A_CORUNA.coordinates[1],
      0,
    ];

    setRotation(targetRotation);
    setScale(focusScale);
  }, [
    baseScale,
    countries.length,
    dimensions.height,
    dimensions.width,
    focusScale,
  ]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (clickTimerRef.current) {
        window.clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const projection = useMemo(() => {
    if (!dimensions.width || !dimensions.height) return null;
    return geoOrthographic()
      .translate([dimensions.width / 2, dimensions.height / 2])
      .scale(scale)
      .rotate(rotation)
      .clipAngle(90);
  }, [dimensions.height, dimensions.width, rotation, scale]);

  const pathGenerator = useMemo(() => {
    if (!projection) return null;
    return geoPath(projection);
  }, [projection]);

  const markerPosition = projection ? projection(A_CORUNA.coordinates) : null;

  const markerVisible = useMemo(() => {
    const [lon, lat] = A_CORUNA.coordinates;
    const center: [number, number] = [-rotation[0], -rotation[1]];
    // Oculta el marker cuando está en el hemisferio trasero.
    return geoDistance([lon, lat], center) < Math.PI / 2;
  }, [rotation]);

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startRotation: rotationRef.current,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragStateRef.current) return;
    const { startX, startY, startRotation } = dragStateRef.current;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    // Drag horizontal/vertical -> longitud/latitud con sensibilidad configurable.
    const nextLambda = startRotation[0] + deltaX * DRAG_SENSITIVITY;
    const nextPhi = startRotation[1] - deltaY * DRAG_SENSITIVITY;
    const clampedPhi = Math.max(-90, Math.min(90, nextPhi));
    setRotation([nextLambda, clampedPhi, 0]);
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleUnlock = () => {
    if (isUnlocked) return;
    setIsUnlocked(true);
    runAnimation(
      rotationRef.current,
      rotationRef.current,
      scaleRef.current,
      baseScale,
      UNLOCK_DURATION,
    );
  };

  const handleEasterEgg = () => {
    if (isUnlocked) return;
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      clickTimerRef.current = window.setTimeout(() => {
        clickCountRef.current = 0;
      }, 600);
    }

    if (clickCountRef.current >= 3) {
      if (clickTimerRef.current) {
        window.clearTimeout(clickTimerRef.current);
      }
      clickCountRef.current = 0;
      handleUnlock();
    }
  };

  const viewBoxWidth = dimensions.width || 1;
  const viewBoxHeight = dimensions.height || 1;

  return (
    <div ref={containerRef} className="h-full w-full">
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleEasterEgg}
        style={{ touchAction: "none", userSelect: "none" }}
      >
        <defs>
          <filter id="badge-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
          </filter>
        </defs>
        <style>
          {`.marker-pulse { animation: pulse 1.8s ease-out infinite; transform-origin: center; }
          @keyframes pulse { 0% { r: 8; opacity: 0.7; } 70% { r: 18; opacity: 0; } 100% { r: 18; opacity: 0; } }`}
        </style>
        {pathGenerator && (
          <>
            <path
              d={pathGenerator({ type: "Sphere" }) ?? undefined}
              fill="#000000"
              stroke="#1f2937"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth={1}
            />
            {countries.map((country, index) => (
              <path
                key={`${country.id ?? "country"}-${index}`}
                d={pathGenerator(country) ?? undefined}
                stroke="#ffffff"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth={3}
              />
            ))}
          </>
        )}
        {markerVisible && markerPosition && (
          <g>
            <g
              transform={`translate(${markerPosition[0] - 205}, ${markerPosition[1] - 16})`}
            >
              <rect
                width={185}
                height={32}
                rx={10}
                fill="rgba(255, 255, 255, 0.18)"
                filter="url(#badge-blur)"
              />
              <rect
                width={185}
                height={32}
                rx={10}
                fill="rgba(255, 255, 255, 0.12)"
                stroke="rgba(255, 255, 255, 0.2)"
              />
              <text
                x={12}
                y={22}
                fontSize={14}
                fill="#f8fafc"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
              >
                Based in A Coruña, Spain
              </text>
            </g>
            <circle
              className="marker-pulse"
              cx={markerPosition[0]}
              cy={markerPosition[1]}
              r={8}
              fill="#ef4444"
            />
            <circle
              cx={markerPosition[0]}
              cy={markerPosition[1]}
              r={8}
              fill="#ef4444"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export default Globe;
