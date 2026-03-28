const logEntries = [
  "Session started",
  "Canvas mounted",
  "Inspector opened",
  "Layers synchronized",
  "Autosave complete",
  "Presence updated",
  "History checkpoint",
  "Comments loaded",
  "Preview refreshed",
  "Export queued",
];

export const MacosBounceScroll = () => {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="border-b border-zinc-300 bg-zinc-100 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/80">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
            Simple scroll area
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            On macOS, keep scrolling with the trackpad when you reach the top or bottom.
          </p>
        </div>

        <div className="h-56 overflow-y-auto bg-zinc-50 px-3 py-3 dark:bg-zinc-950">
          <div className="space-y-2">
            {logEntries.map((entry, index) => (
              <div
                key={entry}
                className="rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                <span className="mr-2 text-zinc-400 dark:text-zinc-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mx-3 text-center text-xs text-zinc-500 italic dark:text-zinc-400">
        You can notice the bouncing effect. This may be acceptable on marketing pages or blogs.
      </p>
    </div>
  );
};
