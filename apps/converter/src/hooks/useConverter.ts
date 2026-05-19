import { useCallback, useState } from "react";
import { convertFile } from "../lib/ffmpeg/convert";
import { loadFFmpeg } from "../lib/ffmpeg/client";
import { downloadBlob, stripExtension } from "../lib/file-utils";
import type { Category, Target } from "../lib/formats";

export type ConversionState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "converting"; current: number; total: number; progress: number }
  | { status: "done"; count: number }
  | { status: "error"; message: string };

export interface ConversionJob {
  category: Category;
  target: Target;
  files: File[];
}

export function useConverter() {
  const [state, setState] = useState<ConversionState>({ status: "idle" });

  const isIdle =
    state.status === "idle" ||
    state.status === "done" ||
    state.status === "error";

  const run = useCallback(async (jobs: ConversionJob[]) => {
    const total = jobs.reduce((acc, j) => acc + j.files.length, 0);
    if (total === 0) return;

    try {
      setState({ status: "loading" });
      const ffmpeg = await loadFFmpeg();

      let currentIndex = 0;
      const onProgress = ({ progress }: { progress: number }) => {
        setState({
          status: "converting",
          current: currentIndex + 1,
          total,
          progress,
        });
      };
      ffmpeg.on("progress", onProgress);

      try {
        for (const job of jobs) {
          for (const file of job.files) {
            setState({
              status: "converting",
              current: currentIndex + 1,
              total,
              progress: 0,
            });
            const blob = await convertFile(ffmpeg, file, job.category, job.target);
            downloadBlob(blob, `${stripExtension(file.name)}.${job.target.ext}`);
            currentIndex += 1;
          }
        }
      } finally {
        ffmpeg.off("progress", onProgress);
      }

      setState({ status: "done", count: total });
    } catch (err) {
      console.error("[converter] conversion failed:", err);
      setState({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  return { state, run, isIdle };
}
