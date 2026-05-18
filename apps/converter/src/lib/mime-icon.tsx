import {
  File as FileIcon,
  FileAudio,
  FileVideo,
  Image,
} from "@juan/ui/icons/phosphor";
import type { Category } from "./formats";

interface IconProps {
  className?: string;
}

export function CategoryIcon({
  category,
  className,
}: { category: Category } & IconProps) {
  if (category === "image") return <Image className={className} />;
  if (category === "audio") return <FileAudio className={className} />;
  if (category === "video") return <FileVideo className={className} />;
  return <FileIcon className={className} />;
}

export function getCategoryLabel(category: Category): string {
  if (category === "image") return "Images";
  if (category === "audio") return "Audio";
  if (category === "video") return "Video";
  return "Files";
}
