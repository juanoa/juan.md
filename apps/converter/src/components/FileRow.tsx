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

interface FileRowProps {
  file: File;
  category: Category;
  onRemove: (file: File) => void;
}

export function FileRow({ file, category, onRemove }: FileRowProps) {
  return (
    <Item variant="outline">
      <ItemMedia variant="icon">
        <CategoryIcon category={category} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{file.name}</ItemTitle>
        <ItemDescription>{formatBytes(file.size)}</ItemDescription>
      </ItemContent>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => onRemove(file)}
        aria-label="Remove file"
      >
        <span aria-hidden>x</span>
      </Button>
    </Item>
  );
}
