import type { FFmpeg } from "@ffmpeg/ffmpeg";
import type { Category, Target } from "../formats";
import { getExtension } from "../file-utils";
import { buildArgs } from "./args";

export async function convertFile(
  ffmpeg: FFmpeg,
  file: File,
  category: Category,
  target: Target,
): Promise<Blob> {
  const { fetchFile } = await import("@ffmpeg/util");
  const inputExt = getExtension(file.name);
  const inputPath = `input.${inputExt}`;
  const outputPath = `output.${target.ext}`;

  await ffmpeg.writeFile(inputPath, await fetchFile(file));
  try {
    await ffmpeg.exec(buildArgs({ inputPath, outputPath, category, target }));
    const data = (await ffmpeg.readFile(outputPath)) as Uint8Array;
    return new Blob([data.buffer as ArrayBuffer], { type: target.value });
  } finally {
    await ffmpeg.deleteFile(inputPath).catch(() => {});
    await ffmpeg.deleteFile(outputPath).catch(() => {});
  }
}
