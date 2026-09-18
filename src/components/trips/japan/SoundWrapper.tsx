import {
  type ComponentPropsWithoutRef,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

const ACTIVE_AUDIO_KEY = "__soundWrapperActiveAudio";

type SoundWindow = Window & {
  [ACTIVE_AUDIO_KEY]?: HTMLAudioElement;
};

interface SoundWrapperProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "aria-pressed" | "onClick" | "onKeyDown" | "role" | "tabIndex"
> {
  scaleWhilePlaying?: boolean;
  src: string;
}

const getSoundWindow = () => window as SoundWindow;

const releaseAudio = (audio: HTMLAudioElement) => {
  const soundWindow = getSoundWindow();

  if (soundWindow[ACTIVE_AUDIO_KEY] === audio) {
    delete soundWindow[ACTIVE_AUDIO_KEY];
  }
};

export function SoundWrapper({
  children,
  className,
  scaleWhilePlaying = false,
  src,
  ...props
}: SoundWrapperProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    const wrapper = wrapperRef.current;

    const preloadAudio = () => {
      if (!audio || audio.preload === "auto") return;

      audio.preload = "auto";
      audio.load();
    };

    const pauseOnOutsideClick = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      if (wrapper?.contains(event.target)) return;

      audio?.pause();
    };

    document.addEventListener("click", pauseOnOutsideClick, true);
    wrapper?.addEventListener("focusin", preloadAudio);
    wrapper?.addEventListener("mouseover", preloadAudio);

    return () => {
      document.removeEventListener("click", pauseOnOutsideClick, true);
      wrapper?.removeEventListener("focusin", preloadAudio);
      wrapper?.removeEventListener("mouseover", preloadAudio);

      if (!audio) return;

      audio.pause();
      releaseAudio(audio);
    };
  }, []);

  const togglePlayback = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (!audio.paused) {
      audio.pause();
      return;
    }

    const soundWindow = getSoundWindow();
    const activeAudio = soundWindow[ACTIVE_AUDIO_KEY];

    if (activeAudio && activeAudio !== audio) {
      activeAudio.pause();
    }

    soundWindow[ACTIVE_AUDIO_KEY] = audio;

    if (audio.ended) {
      audio.currentTime = 0;
    }

    void audio.play().catch(() => {
      releaseAudio(audio);
      setIsPlaying(false);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    togglePlayback();
  };

  return (
    <div
      ref={wrapperRef}
      {...props}
      aria-pressed={isPlaying}
      className={cn(
        "cursor-pointer",
        scaleWhilePlaying &&
          "motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out",
        scaleWhilePlaying && isPlaying && "motion-safe:scale-110",
        className,
      )}
      onClick={togglePlayback}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}>
      {children}
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onEnded={(event) => {
          releaseAudio(event.currentTarget);
          setIsPlaying(false);
        }}
        onPause={(event) => {
          releaseAudio(event.currentTarget);
          setIsPlaying(false);
        }}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  );
}
