import { HomePageHoverCard } from "@/components/HomePageHoverCard";

interface Props {
  text: string;
}

export const InditexHoverCard = ({ text }: Props) => {
  return (
    <HomePageHoverCard text={text}>
      <video src="/inditex-video.webm" autoPlay loop muted playsInline />
    </HomePageHoverCard>
  );
};
