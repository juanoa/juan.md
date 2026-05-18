import { Button } from "@juan/ui/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@juan/ui/components/ui/item";
import { formatBytes } from "../lib/file-utils";
import { CategoryIcon } from "../lib/mime-icon";
import type { Category } from "../lib/formats";

type FileRowStatus = "pending" | "converting" | "done";

interface FileRowProps {
  file: File;
  category: Category;
  onRemove: (file: File) => void;
  status?: FileRowStatus;
  progress?: number;
}

export function FileRow({
  file,
  category,
  onRemove,
  status = "pending",
  progress = 0,
}: FileRowProps) {
  const fillPct =
    status === "done"
      ? 100
      : status === "converting"
        ? Math.min(100, Math.max(0, progress * 100))
        : 0;
  const isConverting = status === "converting";

  return (
    <Item variant="outline" className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 bg-neutral-100 transition-[width] duration-150 ease-out pointer-events-none"
        style={{ width: `${fillPct}%` }}
      />
      <ItemMedia variant="icon" className="relative">
        <CategoryIcon category={category} />
      </ItemMedia>
      <ItemContent className="relative">
        <ItemTitle>{file.name}</ItemTitle>
        <ItemDescription>{formatBytes(file.size)}</ItemDescription>
      </ItemContent>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onRemove(file)}
        aria-label="Remove file"
        disabled={isConverting}
        className="relative"
      >
        <span aria-hidden>x</span>
      </Button>
    </Item>
  );
}
