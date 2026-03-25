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
      <div className="overflow-hidden rounded border border-gray-300 bg-white">
        <div className="border-b border-gray-300 bg-gray-100 px-4 py-3">
          <p className="text-sm font-medium text-gray-800">
            Simple scroll area
          </p>
          <p className="text-xs text-gray-500">
            On macOS, keep scrolling with the trackpad when you reach the top or bottom.
          </p>
        </div>

        <div className="h-56 overflow-y-auto bg-gray-50 px-3 py-3">
          <div className="space-y-2">
            {logEntries.map((entry, index) => (
              <div
                key={entry}
                className="rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                <span className="mr-2 text-gray-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 italic mx-3">
        You can notice the bouncing effect. This may be acceptable on marketing pages or blogs.
      </p>
    </div>
  );
};
