export type Category = "image" | "audio" | "video";

export interface Target {
  value: string;
  label: string;
  ext: string;
  category: Category;
}

export const TARGETS: Target[] = [
  { category: "image", value: "image/png", label: "PNG", ext: "png" },
  { category: "image", value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { category: "image", value: "image/webp", label: "WebP", ext: "webp" },
  { category: "image", value: "image/bmp", label: "BMP", ext: "bmp" },
  { category: "image", value: "image/gif", label: "GIF", ext: "gif" },

  { category: "audio", value: "audio/mpeg", label: "MP3", ext: "mp3" },
  { category: "audio", value: "audio/ogg", label: "OGG", ext: "ogg" },
  { category: "audio", value: "audio/wav", label: "WAV", ext: "wav" },
  { category: "audio", value: "audio/flac", label: "FLAC", ext: "flac" },
  { category: "audio", value: "audio/aac", label: "AAC", ext: "aac" },
  { category: "audio", value: "audio/opus", label: "Opus", ext: "opus" },
  { category: "audio", value: "audio/mp4", label: "M4A", ext: "m4a" },
  { category: "audio", value: "audio/webm", label: "WebM", ext: "webm" },

  { category: "video", value: "video/mp4", label: "MP4 (H.264)", ext: "mp4" },
  { category: "video", value: "video/webm", label: "WebM (VP9)", ext: "webm" },
  { category: "video", value: "video/quicktime", label: "MOV", ext: "mov" },
  { category: "video", value: "video/x-matroska", label: "MKV", ext: "mkv" },
  { category: "video", value: "image/gif", label: "GIF", ext: "gif" },
];

export function targetsFor(category: Category): Target[] {
  return TARGETS.filter((t) => t.category === category);
}

export function defaultTargetFor(category: Category): Target {
  const defaults: Record<Category, string> = {
    image: "image/webp",
    audio: "audio/mpeg",
    video: "video/mp4",
  };
  const list = targetsFor(category);
  return list.find((t) => t.value === defaults[category]) ?? list[0];
}
