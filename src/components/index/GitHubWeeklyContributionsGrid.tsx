import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type WeeklyContribution = {
  start: string;
  end: string;
  total: number;
  toneClass: string;
};

interface Props {
  weeklyContributions: WeeklyContribution[];
}

const getIsoWeekInfo = (date: Date) => {
  const normalizedDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayOfWeek = normalizedDate.getUTCDay() || 7;

  normalizedDate.setUTCDate(normalizedDate.getUTCDate() + 4 - dayOfWeek);

  const weekYear = normalizedDate.getUTCFullYear();
  const firstDayOfYear = new Date(Date.UTC(weekYear, 0, 1));
  const weekNumber = Math.ceil(
    ((normalizedDate.getTime() - firstDayOfYear.getTime()) / 86_400_000 + 1) /
      7,
  );

  return {
    weekNumber,
    weekYear,
  };
};

const getWeekLabel = (start: string, end: string) => {
  const bucketStart = new Date(`${start}T00:00:00.000Z`);
  const bucketEnd = new Date(`${end}T00:00:00.000Z`);
  const midpoint = new Date(
    bucketStart.getTime() +
      Math.floor((bucketEnd.getTime() - bucketStart.getTime()) / 2),
  );
  const { weekNumber, weekYear } = getIsoWeekInfo(midpoint);

  return `Week ${weekNumber}, ${weekYear}`;
};

const getContributionLabel = (total: number) =>
  total === 1 ? "1 contribution" : `${total} contributions`;

export const GitHubWeeklyContributionsGrid = ({
  weeklyContributions,
}: Props) => (
  <TooltipProvider delay={500}>
    <div className="grid grid-cols-30 gap-0.75 sm:grid-cols-52">
      {weeklyContributions.map((week) => {
        const label = `${getWeekLabel(week.start, week.end)}: ${getContributionLabel(week.total)}`;

        return (
          <Tooltip key={week.start}>
            <TooltipTrigger
              render={
                <div
                  className={`aspect-square rounded-[2px] ${week.toneClass}`}
                />
              }
            />
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  </TooltipProvider>
);
