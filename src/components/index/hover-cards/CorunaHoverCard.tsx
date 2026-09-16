import { useEffect, useRef, useState } from "react";

import { HomePageHoverCard } from "@/components/HomePageHoverCard";

interface Props {
  text: string;
}

export const CorunaHoverCard = ({ text }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      setShouldReduceMotion(mediaQuery.matches);

      if (mediaQuery.matches) {
        videoRef.current?.pause();
      } else {
        void videoRef.current?.play();
      }
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () =>
      mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  return (
    <HomePageHoverCard text={text}>
      <video
        ref={videoRef}
        controls={shouldReduceMotion}
        loop
        muted
        playsInline
        aria-hidden={shouldReduceMotion ? undefined : "true"}
        aria-label={shouldReduceMotion ? "A Coruña aerial map" : undefined}
        autoPlay>
        <source src="/coruna-map-web.webm" type="video/webm" />
        <source src="/coruna-map-web.mp4" type="video/mp4" />
      </video>
    </HomePageHoverCard>
  );
};
