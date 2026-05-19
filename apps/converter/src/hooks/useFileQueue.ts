import { useCallback, useState } from "react";
import { dedupeKey } from "../lib/file-utils";

export function useFileQueue() {
  const [files, setFiles] = useState<File[]>([]);

  const add = useCallback((incoming: FileList | File[] | null) => {
    if (!incoming) return;
    setFiles((prev) => {
      const existing = new Set(prev.map(dedupeKey));
      const next = Array.from(incoming).filter((f) => !existing.has(dedupeKey(f)));
      return [...prev, ...next];
    });
  }, []);

  const remove = useCallback((file: File) => {
    setFiles((prev) => prev.filter((f) => f !== file));
  }, []);

  const clear = useCallback(() => setFiles([]), []);

  return { files, add, remove, clear };
}
