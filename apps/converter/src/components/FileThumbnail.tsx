import { useEffect, useState } from "react";
import { CategoryIcon } from "../lib/mime-icon";
import type { Category } from "../lib/formats";

interface FileThumbnailProps {
  file: File;
  category: Category;
}

type Preview = { file: File; url: string };

export function FileThumbnail({ file, category }: FileThumbnailProps) {
  const [imagePreview, setImagePreview] = useState<Preview | null>(null);

  useEffect(() => {
    if (category !== "image") return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImagePreview({ file, url });
    return () => URL.revokeObjectURL(url);
  }, [file, category]);

  const [videoCapture, setVideoCapture] = useState<Preview | null>(null);

  useEffect(() => {
    if (category !== "video") return;

    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.crossOrigin = "anonymous";
    video.src = objectUrl;

    let cancelled = false;

    const cleanupVideo = () => {
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(objectUrl);
    };

    const onLoadedMetadata = () => {
      const duration = isFinite(video.duration) ? video.duration : 0;
      video.currentTime = Math.min(0.1, duration / 2);
    };

    const onSeeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanupVideo();
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        if (!cancelled) setVideoCapture({ file, url: dataUrl });
      } catch {
        // ignore: fall back to icon
      } finally {
        cleanupVideo();
      }
    };

    const onError = () => cleanupVideo();

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
  }, [file, category]);

  const previewUrl =
    category === "image" && imagePreview?.file === file
      ? imagePreview.url
      : category === "video" && videoCapture?.file === file
        ? videoCapture.url
        : null;

  if (previewUrl) {
    return (
      <img
        src={previewUrl}
        alt=""
        className="size-5 aspect-square rounded-xs object-cover"
      />
    );
  }

  return <CategoryIcon category={category} />;
}
