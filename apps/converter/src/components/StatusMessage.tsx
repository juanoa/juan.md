import type { ConversionState } from "../hooks/useConverter";

interface StatusMessageProps {
  state: ConversionState;
}

export function StatusMessage({ state }: StatusMessageProps) {
  if (state.status === "error") {
    return (
      <p className="text-destructive text-center text-xs">{state.message}</p>
    );
  }
  if (state.status === "done") {
    return (
      <p className="text-muted-foreground text-center text-xs">
        {state.count} file{state.count !== 1 ? "s" : ""} converted
      </p>
    );
  }
  return null;
}
