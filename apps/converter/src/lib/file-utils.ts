import { getCategory } from "./categorize";
import type { Category } from "./formats";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function dedupeKey(file: File): string {
  return `${file.name}-${file.size}`;
}

export function getExtension(filename: string): string {
  const ext = filename.split(".").pop();
  return ext && ext !== filename ? ext.toLowerCase() : "bin";
}

export function stripExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

export interface CategorizedFiles {
  category: Category;
  files: File[];
}

export function groupByCategory(files: File[]): CategorizedFiles[] {
  const map = new Map<Category, File[]>();
  for (const file of files) {
    const cat = getCategory(file.type);
    if (cat === "other") continue;
    const existing = map.get(cat);
    if (existing) existing.push(file);
    else map.set(cat, [file]);
  }
  return Array.from(map.entries()).map(([category, files]) => ({
    category,
    files,
  }));
}
