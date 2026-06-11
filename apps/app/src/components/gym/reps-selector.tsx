import { useRef, useState } from "react";

import { Input } from "@juan/ui/components/ui/input";
import { cn } from "@juan/ui/lib/utils";

const PRESET_REPS = Array.from({ length: 12 }, (_, index) => index + 1);

interface RepsSelectorProps {
  value: number | undefined;
  onChange: (reps: number) => void;
}

function isPreset(value: number | undefined): value is number {
  return value !== undefined && value >= 1 && value <= 12 && Number.isInteger(value);
}

export function RepsSelector({ value, onChange }: RepsSelectorProps) {
  const [customMode, setCustomMode] = useState(
    value !== undefined && !isPreset(value),
  );
  const [draft, setDraft] = useState<string>(
    value !== undefined && !isPreset(value) ? String(value) : "",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const selectPreset = (reps: number) => {
    setCustomMode(false);
    setDraft("");
    onChange(reps);
  };

  const enterCustom = () => {
    setCustomMode(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const commitCustom = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onChange(parsed);
  };

  return (
    <div className="grid w-full grid-cols-7 gap-1 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
      {PRESET_REPS.map((reps) => {
        const selected = !customMode && value === reps;
        return (
          <button
            key={reps}
            type="button"
            onClick={() => selectPreset(reps)}
            data-state={selected ? "on" : "off"}
            className={cn(
              "ring-foreground/15 inline-flex h-8 w-full items-center justify-center bg-background text-xs tabular-nums ring-1 transition-colors sm:h-7 sm:w-7",
              "hover:bg-muted",
              selected && "bg-foreground text-background ring-foreground",
            )}
          >
            {reps}
          </button>
        );
      })}
      {customMode ? (
        <Input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          min={0}
          value={draft}
          placeholder="Other"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commitCustom}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          className="col-span-2 h-8 w-full sm:h-7 sm:w-16"
        />
      ) : (
        <button
          type="button"
          onClick={enterCustom}
          className="ring-foreground/15 hover:bg-muted col-span-2 inline-flex h-8 w-full items-center justify-center bg-background px-2 text-xs ring-1 transition-colors sm:h-7 sm:w-16"
        >
          Other
        </button>
      )}
    </div>
  );
}
