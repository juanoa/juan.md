// Two-period sine wave path (0..512 SVG units). The second period tiles seamlessly
// with the first because it ends at the same y-value and slope as the start.
// Amplitude 64, center y=128, stroke-width 16 to match the Phosphor icon visual weight.
const WAVE_PATH =
  "M 0,128 C 21,95 43,64 64,64 C 85,64 107,95 128,128 " +
  "C 149,162 171,192 192,192 C 213,192 235,162 256,128 " +
  "C 277,95 299,64 320,64 C 341,64 363,95 384,128 " +
  "C 405,162 427,192 448,192 C 469,192 491,162 512,128";

interface WaveSineProps {
  size?: number;
  className?: string;
}

export function WaveSine({ size = 32, className }: WaveSineProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
      overflow="hidden"
      aria-hidden="true"
      className={className}
      // --wave-period maps one SVG period (256 user units) to the rendered CSS size.
      // translateX(-size px) = translateX(-256 SVG units) = exactly one full period.
      style={{ "--wave-period": `-${size}px` } as React.CSSProperties}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinecap="round"
        strokeLinejoin="round"
        d={WAVE_PATH}
        className="animate-wave-slide"
      />
    </svg>
  );
}
