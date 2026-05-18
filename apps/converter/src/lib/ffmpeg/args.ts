import type { Category, Target } from "../formats";

interface BuildArgsInput {
  inputPath: string;
  outputPath: string;
  category: Category;
  target: Target;
}

export function buildArgs({
  inputPath,
  outputPath,
  category,
  target,
}: BuildArgsInput): string[] {
  const args = ["-i", inputPath, ...codecArgs(category, target.ext), outputPath];
  return args;
}

function codecArgs(category: Category, ext: string): string[] {
  if (category === "image") {
    if (ext === "jpg") return ["-q:v", "3"];
    if (ext === "webp") return ["-quality", "85"];
    return [];
  }

  if (category === "audio") {
    if (ext === "mp3") return ["-c:a", "libmp3lame", "-q:a", "4"];
    if (ext === "opus") return ["-c:a", "libopus", "-b:a", "96k"];
    if (ext === "ogg") return ["-c:a", "libvorbis", "-q:a", "5"];
    if (ext === "aac") return ["-c:a", "aac", "-b:a", "192k"];
    if (ext === "m4a") return ["-c:a", "aac", "-b:a", "192k"];
    if (ext === "webm") return ["-c:a", "libopus", "-b:a", "96k"];
    return [];
  }

  // video
  if (ext === "mp4")
    return [
      "-c:v", "libx264",
      "-crf", "22",
      "-preset", "veryfast",
      "-movflags", "+faststart",
      "-c:a", "aac",
      "-b:a", "128k",
    ];
  if (ext === "webm")
    return [
      "-c:v", "libvpx-vp9",
      "-crf", "32",
      "-b:v", "0",
      "-c:a", "libopus",
      "-b:a", "96k",
    ];
  if (ext === "mov")
    return ["-c:v", "libx264", "-crf", "22", "-preset", "veryfast", "-c:a", "aac"];
  if (ext === "mkv")
    return ["-c:v", "libx264", "-crf", "22", "-preset", "veryfast", "-c:a", "aac"];
  if (ext === "gif") return ["-vf", "fps=12,scale=480:-1:flags=lanczos"];
  return [];
}
