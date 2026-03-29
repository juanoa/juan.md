import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@juan/ui/components/ui/hover-card";

interface Props {
  text: string;
  children?: React.ReactNode | string;
}

export const HomePageHoverCard = ({ text, children }: Props) => {
  return (
    <HoverCard>
      <HoverCardTrigger>{text}</HoverCardTrigger>
      <HoverCardContent side="top">{children}</HoverCardContent>
    </HoverCard>
  );
};
