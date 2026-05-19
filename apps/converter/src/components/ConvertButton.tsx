import { Button } from "@juan/ui/components/ui/button";
import { Spinner } from "@juan/ui/components/ui/spinner";
import type { ConversionState } from "../hooks/useConverter";

interface ConvertButtonProps {
  state: ConversionState;
  isIdle: boolean;
  total: number;
  onConvert: () => void;
}

export function ConvertButton({
  state,
  isIdle,
  total,
  onConvert,
}: ConvertButtonProps) {
  return (
    <Button onClick={onConvert} disabled={!isIdle || total === 0}>
      {state.status === "loading" && (
        <>
          <Spinner />
          Loading ffmpeg...
        </>
      )}
      {state.status === "converting" && (
        <>
          <Spinner />
          Converting {state.current}/{state.total}
          {state.progress > 0 && ` - ${Math.round(state.progress * 100)}%`}
        </>
      )}
      {isIdle &&
        (total === 0
          ? "No files to convert"
          : `Convert ${total} file${total !== 1 ? "s" : ""}`)}
    </Button>
  );
}
