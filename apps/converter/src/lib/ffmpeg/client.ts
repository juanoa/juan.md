import type { FFmpeg } from "@ffmpeg/ffmpeg";

let instance: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (instance) return instance;
  if (loading) return loading;

  loading = (async () => {
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: "/ffmpeg-core.js",
      wasmURL: "/ffmpeg-core.wasm",
    });
    instance = ffmpeg;
    return ffmpeg;
  })();

  return loading;
}
