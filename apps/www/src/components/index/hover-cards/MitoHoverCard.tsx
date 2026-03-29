import { HomePageHoverCard } from "@/components/HomePageHoverCard";

interface Props {
  text: string;
}

export const MitoHoverCard = ({ text }: Props) => {
  return (
    <HomePageHoverCard text={text}>
      <div className="flex gap-2">
        <img src="/mito-logo.webp" className="size-10" />
        <div className="pt-1 leading-4">Video creation tools powered by AI</div>
      </div>
    </HomePageHoverCard>
  );
};
