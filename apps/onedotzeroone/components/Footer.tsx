export function Footer() {
  return (
    <footer className="text-muted-foreground relative h-24 overflow-visible">
      <svg
        aria-hidden="true"
        className="text-foreground pointer-events-none absolute inset-x-0 bottom-0 h-[300%] w-full overflow-visible opacity-30"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 1200 300">
        <path
          d="M0 288 C430 286 760 264 940 190 C1070 136 1145 62 1200 0"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl items-center justify-between px-4 text-sm">
        <span>1.01^n</span>
      </div>
    </footer>
  );
}
