import { HomePageHoverCard } from "@/components/HomePageHoverCard";
import { XerionGallery } from "@/components/xerion/XerionGallery";

interface Props {
  text: string;
}

export const CorunaHoverCard = ({ text }: Props) => {
  return (
    <HomePageHoverCard text={text}>
      <div className="p-4">
        <XerionGallery />
      </div>
    </HomePageHoverCard>
  );
};
