import { HomePageHoverCard } from "@/components/HomePageHoverCard";

interface Props {
  text: string;
}

export const MitoHoverCard = ({ text }: Props) => {
  return (
    <HomePageHoverCard text={text}>
      <video src="/mito-video.webm" autoPlay loop muted playsInline />
    </HomePageHoverCard>
  );
};
