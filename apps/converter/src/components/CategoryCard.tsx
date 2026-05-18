import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";
import { ItemGroup } from "@juan/ui/components/ui/item";
import { CategoryIcon, getCategoryLabel } from "../lib/mime-icon";
import { targetsFor, type Category, type Target } from "../lib/formats";
import { FormatSelect } from "./FormatSelect";
import { FileRow } from "./FileRow";

interface CategoryCardProps {
  category: Category;
  files: File[];
  target: Target;
  onTargetChange: (target: Target) => void;
  onRemoveFile: (file: File) => void;
}

export function CategoryCard({
  category,
  files,
  target,
  onTargetChange,
  onRemoveFile,
}: CategoryCardProps) {
  const options = targetsFor(category);

  const handleChange = (value: string) => {
    const next = options.find((t) => t.value === value);
    if (next) onTargetChange(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CategoryIcon category={category} className="size-3.5" />
          {getCategoryLabel(category)}
          <span className="text-muted-foreground font-normal">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </span>
        </CardTitle>
        <CardAction>
          <FormatSelect
            options={options}
            value={target.value}
            onChange={handleChange}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          {files.map((file) => (
            <FileRow
              key={`${file.name}-${file.size}`}
              file={file}
              category={category}
              onRemove={onRemoveFile}
            />
          ))}
        </ItemGroup>
      </CardContent>
    </Card>
  );
}
