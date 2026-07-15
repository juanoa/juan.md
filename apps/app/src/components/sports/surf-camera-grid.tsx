import Hls from "hls.js/light";
import { useEffect, useRef, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";
import { cn } from "@juan/ui/lib/utils";

const SURF_CAMERAS = [
  {
    title: "Caion Surf House",
    streamUrl:
      "https://wow.camaramar.com/camaramar/44_caionsurfhouse.stream/playlist.m3u8",
  },
  {
    title: "Bastiagueiro",
    streamUrl:
      "https://wow.camaramar.com/camaramar/17_bastiagueiro.stream/playlist.m3u8",
  },
  {
    title: "Matadero",
    streamUrl:
      "https://wow.camaramar.com/camaramar/62_matadero.stream/playlist.m3u8",
  },
  {
    title: "Razo",
    streamUrl:
      "https://wow.camaramar.com/camaramar/5_razo.stream/playlist.m3u8",
  },
] as const;

export const CAION_SURF_CAMERA = SURF_CAMERAS[0];

type PlayerStatus = "loading" | "ready" | "unsupported" | "error";

export function SurfCameraGrid() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {SURF_CAMERAS.map((camera) => (
        <SurfCameraCard
          key={camera.streamUrl}
          title={camera.title}
          streamUrl={camera.streamUrl}
        />
      ))}
    </div>
  );
}

interface SurfCameraCardProps {
  className?: string;
  showTitle?: boolean;
  title: string;
  streamUrl: string;
}

export function SurfCameraCard({
  className,
  showTitle = true,
  title,
  streamUrl,
}: SurfCameraCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<PlayerStatus>("loading");

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const handleVideoReady = () => setStatus("ready");
    const handleVideoError = () => setStatus("error");

    video.addEventListener("loadedmetadata", handleVideoReady);
    video.addEventListener("error", handleVideoError);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;

      return () => {
        video.removeEventListener("loadedmetadata", handleVideoReady);
        video.removeEventListener("error", handleVideoError);
        video.removeAttribute("src");
        video.load();
      };
    }

    if (!Hls.isSupported()) {
      const timeoutId = window.setTimeout(() => setStatus("unsupported"), 0);

      return () => {
        window.clearTimeout(timeoutId);
        video.removeEventListener("loadedmetadata", handleVideoReady);
        video.removeEventListener("error", handleVideoError);
      };
    }

    const hls = new Hls({
      liveDurationInfinity: true,
    });

    hls.loadSource(streamUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => setStatus("ready"));
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        setStatus("error");
      }
    });

    return () => {
      hls.destroy();
      video.removeEventListener("loadedmetadata", handleVideoReady);
      video.removeEventListener("error", handleVideoError);
      video.removeAttribute("src");
      video.load();
    };
  }, [streamUrl]);

  const message = getStatusMessage(status);

  return (
    <Card className={cn("gap-0 py-0", className)}>
      <CardContent className="p-0">
        <div className="bg-muted relative aspect-video overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            className="h-full w-full bg-black object-cover"
            controls
            muted
            playsInline
          />
          {message ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/55 px-4 text-center text-sm text-white">
              {message}
            </div>
          ) : null}
        </div>
      </CardContent>
      {showTitle ? (
        <CardHeader className="border-t py-4">
          <CardTitle className="flex items-center justify-between gap-3">
            <span>{title}</span>
            <span className="bg-destructive size-2 shrink-0 rounded-full" />
          </CardTitle>
        </CardHeader>
      ) : null}
    </Card>
  );
}

function getStatusMessage(status: PlayerStatus) {
  if (status === "loading") {
    return "Loading live stream...";
  }

  if (status === "unsupported") {
    return "This browser cannot play this live stream.";
  }

  if (status === "error") {
    return "The live stream is unavailable.";
  }

  return null;
}
