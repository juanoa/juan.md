import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Week } from "./github-contributions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type WeeklyContribution = Week & { toneClass: string };

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

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});
const ordinalRules = new Intl.PluralRules("en-US", { type: "ordinal" });
const ordinalSuffix: Record<string, string> = {
  one: "st",
  two: "nd",
  few: "rd",
};

function formatDate(value: string) {
  const date = new Date(value + "T00:00:00Z");
  const day = date.getUTCDate();
  const suffix = ordinalSuffix[ordinalRules.select(day)] ?? "th";
  return `${day}${suffix} ${monthFormat.format(date)}. ${date.getUTCFullYear()}`;
}

const getContributionLabel = (total: number) =>
  total === 1 ? "1 contribution" : `${total} contributions`;

function WeekNavigationButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const label = direction === "previous" ? "Previous week" : "Next week";
  const Icon = direction === "previous" ? ArrowLeft : ArrowRight;
  return (
    <Tooltip>
      <TooltipTrigger
        disabled={disabled}
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          >
            <Icon aria-hidden="true" />
          </Button>
        }
      />
      {!disabled && <TooltipContent>{label}</TooltipContent>}
    </Tooltip>
  );
}

export const GitHubWeeklyContributionsGrid = ({
  weeklyContributions,
}: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const selected = weeklyContributions[selectedIndex];
  const lastIndex = weeklyContributions.length - 1;
  function moveWeek(offset: number) {
    setSelectedIndex((index) =>
      Math.max(0, Math.min(index + offset, lastIndex)),
    );
  }
  const [failedIcons, setFailedIcons] = useState<Set<string>>(() => new Set());
  const hasIcons = selected?.repositories.some(
    (repo) => repo.favicon && !failedIcons.has(repo.favicon),
  );
  const remainder = selected
    ? selected.total -
      selected.privateCount -
      selected.repositories.reduce((sum, repo) => sum + repo.count, 0)
    : 0;
  return (
    <Dialog>
      <TooltipProvider delay={500}>
        <div className="grid grid-cols-30 gap-0.75 sm:grid-cols-52">
          {weeklyContributions.map((week, index) => {
            const label = `${getWeekLabel(week.start, week.end)}: ${getContributionLabel(week.total)}`;

            return (
              <Tooltip key={week.start}>
                <TooltipTrigger
                  render={
                    <DialogTrigger
                      aria-label={label}
                      onClick={() => setSelectedIndex(index)}
                      className={`aspect-square cursor-pointer rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 ${week.toneClass}`}
                    />
                  }
                />
                <TooltipContent>
                  {label}
                  <br />
                  Click for more info
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
      {selected && (
        <DialogContent
          onKeyDown={(event) => {
            if (
              event.altKey ||
              event.ctrlKey ||
              event.metaKey ||
              event.shiftKey
            )
              return;
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            moveWeek(event.key === "ArrowLeft" ? -1 : 1);
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-1 pr-8">
              <TooltipProvider delay={300}>
                <WeekNavigationButton
                  direction="previous"
                  disabled={selectedIndex === 0}
                  onClick={() => moveWeek(-1)}
                />
                <DialogTitle aria-live="polite" aria-atomic="true">
                  {getWeekLabel(selected.start, selected.end)}
                </DialogTitle>
                <WeekNavigationButton
                  direction="next"
                  disabled={selectedIndex === lastIndex}
                  onClick={() => moveWeek(1)}
                />
              </TooltipProvider>
            </div>
            <DialogDescription>
              {getContributionLabel(selected.total)} ·{" "}
              {formatDate(selected.start)} – {formatDate(selected.end)}
            </DialogDescription>
          </DialogHeader>
          {selected.total === 0 ? (
            <p>No contributions this week.</p>
          ) : (
            <ul
              key={selected.start}
              className={`grid max-h-[55dvh] gap-2 overflow-y-auto [&>li]:col-span-full [&>li]:grid [&>li]:grid-cols-subgrid [&>li]:items-center ${hasIcons ? "grid-cols-[1rem_minmax(0,1fr)_max-content_max-content]" : "grid-cols-[minmax(0,1fr)_max-content_max-content]"}`}
            >
              {selected.repositories.map((repo) => (
                <li key={repo.name}>
                  {hasIcons && (
                    <span aria-hidden="true" className="size-4">
                      {repo.favicon && !failedIcons.has(repo.favicon) && (
                        <img
                          key={repo.favicon}
                          src={repo.favicon}
                          alt=""
                          width={16}
                          height={16}
                          referrerPolicy="no-referrer"
                          className="size-4 object-contain"
                          onError={(event) => {
                            const url = event.currentTarget.getAttribute("src");
                            if (url)
                              setFailedIcons((previous) =>
                                new Set(previous).add(url),
                              );
                          }}
                        />
                      )}
                    </span>
                  )}
                  <a
                    className="break-all underline underline-offset-2"
                    href={`https://github.com/${repo.name}`}
                  >
                    {repo.name}
                  </a>
                  {repo.lines && (
                    <span
                      className="col-span-2 grid grid-cols-subgrid text-right font-mono text-xs whitespace-nowrap tabular-nums"
                      title="Lines added and deleted in commits this week"
                    >
                      <span className="text-green-700 dark:text-green-400">
                        +{repo.lines.additions.toLocaleString("en-US")}
                        <span className="sr-only"> lines added</span>
                      </span>
                      <span className="text-red-700 dark:text-red-400">
                        −{repo.lines.deletions.toLocaleString("en-US")}
                        <span className="sr-only"> lines deleted</span>
                      </span>
                    </span>
                  )}
                </li>
              ))}
              {selected.privateCount > 0 && (
                <li>
                  <span className={hasIcons ? "col-start-2" : undefined}>
                    Private contributions
                  </span>
                  <span className="col-span-2 text-right font-mono text-xs tabular-nums">
                    {selected.privateCount}
                  </span>
                </li>
              )}
              {remainder > 0 && (
                <li>
                  <span className={hasIcons ? "col-start-2" : undefined}>
                    Other contributions
                  </span>
                  <span className="col-span-2 text-right">{remainder}</span>
                </li>
              )}
            </ul>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
};
