import { Button } from "@juan/ui/components/ui/button";
import { Input } from "@juan/ui/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@juan/ui/components/ui/sheet";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@juan/ui/components/ui/toggle-group";

import type { TodoBulletStyle, TodoPreferences } from "../../lib/todos/types";
import { useTodosContext } from "./TodosContext";

interface TodoPreferencesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLUMN_COUNTS: TodoPreferences["columnCount"][] = [1, 3, 5, 7];
const BULLET_STYLES: { value: TodoBulletStyle; label: string }[] = [
  { value: "none", label: "None" },
  { value: "circle", label: "•" },
  { value: "square", label: "▪" },
  { value: "indent", label: "→|" },
];

export function TodoPreferencesSheet({
  open,
  onOpenChange,
}: TodoPreferencesSheetProps) {
  const { preferences, updatePreferences } = useTodosContext();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Preferences</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-5 px-4 pb-4">
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">Columns</h3>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={0}
              value={String(preferences.columnCount)}
              onValueChange={(value) => {
                if (value) {
                  void updatePreferences({
                    columnCount: Number(
                      value,
                    ) as TodoPreferences["columnCount"],
                  });
                }
              }}>
              {COLUMN_COUNTS.map((count) => (
                <ToggleGroupItem key={count} value={String(count)}>
                  {count}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">Bullets</h3>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={0}
              value={preferences.bulletStyle}
              onValueChange={(value) => {
                if (value) {
                  void updatePreferences({
                    bulletStyle: value as TodoBulletStyle,
                  });
                }
              }}>
              {BULLET_STYLES.map((style) => (
                <ToggleGroupItem key={style.value} value={style.value}>
                  {style.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">Focus timer</h3>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={240}
                value={preferences.focusMinutes}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (Number.isFinite(next) && next >= 1 && next <= 240) {
                    void updatePreferences({ focusMinutes: next });
                  }
                }}
                className="w-24"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
