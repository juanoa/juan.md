import { useRef, useState } from "react";
import { UploadSimple } from "@juan/ui/icons/phosphor";

interface DropZoneProps {
  onFiles: (files: FileList) => void;
}

export function DropZone({ onFiles }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
      <button
        className={[
          "border-border mb-8 flex w-full flex-col items-center justify-center gap-3 border border-dashed py-12 text-xs outline-none transition-colors duration-150",
          dragging
            ? "border-foreground bg-muted"
            : "hover:border-foreground hover:bg-muted/50 focus-visible:border-foreground",
        ].join(" ")}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <UploadSimple className="text-muted-foreground size-6" />
        <span className="text-muted-foreground">
          {dragging ? "Drop files" : "Drop files or click to browse"}
        </span>
      </button>
    </>
  );
}
