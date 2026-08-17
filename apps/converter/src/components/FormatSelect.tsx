import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@juan/ui/components/ui/select";
import type { Target } from "../lib/formats";

interface FormatSelectProps {
  options: Target[];
  value: string;
  onChange: (value: string) => void;
}

export function FormatSelect({ options, value, onChange }: FormatSelectProps) {
  return (
    <Select
      items={options.map((option) => ({
        value: option.value,
        label: option.label,
      }))}
      value={value}
      onValueChange={(nextValue) => nextValue && onChange(nextValue)}>
      <SelectTrigger size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((t) => (
          <SelectItem key={t.value + t.ext} value={t.value}>
            {t.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
