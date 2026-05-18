import { useMemo, useState } from "react";
import { RepeatIcon } from "@juan/ui/icons/phosphor";
import { DropZone } from "./components/DropZone";
import { CategoryCard } from "./components/CategoryCard";
import { ConvertButton } from "./components/ConvertButton";
import { StatusMessage } from "./components/StatusMessage";
import { useFileQueue } from "./hooks/useFileQueue";
import { useConverter, type ConversionJob } from "./hooks/useConverter";
import { groupByCategory } from "./lib/file-utils";
import { defaultTargetFor, type Category, type Target } from "./lib/formats";

export default function App() {
  const { files, add, remove } = useFileQueue();
  const { state, run, isIdle } = useConverter();
  const [targets, setTargets] = useState<Partial<Record<Category, Target>>>({});

  const groups = useMemo(() => groupByCategory(files), [files]);

  const resolvedTargets = useMemo(() => {
    const next: Record<string, Target> = {};
    for (const g of groups) {
      next[g.category] = targets[g.category] ?? defaultTargetFor(g.category);
    }
    return next as Record<Category, Target>;
  }, [groups, targets]);

  const handleConvert = () => {
    const jobs: ConversionJob[] = groups.map((g) => ({
      category: g.category,
      target: resolvedTargets[g.category],
      files: g.files,
    }));
    run(jobs);
  };

  const total = files.length;

  return (
    <div className="bg-background text-foreground min-h-screen font-mono">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-sm font-medium flex items-center gap-2">
              <RepeatIcon />
              Serverless Converter
            </h1>
            <p className="text-xs text-muted-foreground">Convert all your media right in your browser</p>
          </div>
          {total > 0 && (
            <span className="text-muted-foreground text-xs">
              {total} file{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <DropZone onFiles={add} />

        {groups.length > 0 && (
          <div className="flex flex-col gap-6">
            {groups.map((g) => (
              <CategoryCard
                key={g.category}
                category={g.category}
                files={g.files}
                target={resolvedTargets[g.category]}
                onTargetChange={(t) =>
                  setTargets((prev) => ({ ...prev, [g.category]: t }))
                }
                onRemoveFile={remove}
              />
            ))}

            <div className="flex flex-col items-stretch gap-2 pt-2">
              <StatusMessage state={state} />
              <ConvertButton
                state={state}
                isIdle={isIdle}
                total={total}
                onConvert={handleConvert}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
