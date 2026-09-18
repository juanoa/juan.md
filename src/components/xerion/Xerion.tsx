import { useEffect, useRef, useState, type CSSProperties } from "react";

import styles from "./Xerion.module.css";

interface Props {
  interval?: number;
  mosaics: string[][];
}

type TileStyle = CSSProperties & {
  "--tile-delay": string;
};

export const Xerion = ({ interval = 2600, mosaics }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const mosaicCount = mosaics.length;
  const initialMosaic = mosaics[0];
  const activeMosaic = mosaics[activeIndex] ?? initialMosaic;
  const columns = initialMosaic?.[0]?.length ?? 0;

  useEffect(() => {
    const container = containerRef.current;

    if (!container || mosaicCount < 2) return;

    let timeoutId: number | undefined;
    let isVisible = true;

    const stop = () => {
      if (timeoutId === undefined) return;

      window.clearTimeout(timeoutId);
      timeoutId = undefined;
    };

    const schedule = () => {
      stop();

      if (!isVisible || document.hidden) return;

      timeoutId = window.setTimeout(() => {
        setActiveIndex((index) => (index + 1) % mosaicCount);
        schedule();
      }, interval);
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      schedule();
    });
    const handleVisibilityChange = () => schedule();

    visibilityObserver.observe(container);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    schedule();

    return () => {
      stop();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [interval, mosaicCount]);

  if (!initialMosaic || !activeMosaic || columns === 0) return null;

  const lastWavePosition = activeMosaic.length + columns - 2;

  return (
    <div
      ref={containerRef}
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="img"
      aria-label={`Xerion mosaic cycling through ${mosaicCount} designs`}
    >
      {initialMosaic.flatMap((row, rowIndex) =>
        [...row].map((_, columnIndex) => {
          const isFilled = activeMosaic[rowIndex]?.[columnIndex] === "#";
          const diagonalPosition = rowIndex + columnIndex;
          const wavePosition =
            activeIndex % 2 === 0
              ? lastWavePosition - diagonalPosition
              : diagonalPosition;
          const tileStyle: TileStyle = {
            "--tile-delay": `${wavePosition * 14}ms`,
          };

          return (
            <div
              key={`${rowIndex}-${columnIndex}`}
              aria-hidden="true"
              className={`${styles.tile} ${isFilled ? styles.filled : ""} aspect-square bg-blue-500`}
              style={tileStyle}
            />
          );
        }),
      )}
    </div>
  );
};
