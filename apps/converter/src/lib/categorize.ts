import type { Category } from "./formats";

export function getCategory(mimeType: string): Category | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("video/")) return "video";
  return "other";
}

export function isConvertible(mimeType: string): boolean {
  return getCategory(mimeType) !== "other";
}
