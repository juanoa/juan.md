"use client";

import * as React from "react";

import { Button } from "@juan/ui/components/ui/button";
import { DiceThreeIcon } from "@juan/ui/icons/phosphor";

interface RandomCollocationButtonProps {
  slugs: string[];
  currentSlug?: string;
  className?: string;
  label?: string;
  showWhenRandomQueryParam?: boolean;
}

export function RandomCollocationButton({
  slugs,
  currentSlug,
  className,
  label = "Random",
  showWhenRandomQueryParam = false,
}: RandomCollocationButtonProps) {
  const [shouldRender, setShouldRender] = React.useState(
    !showWhenRandomQueryParam,
  );

  React.useEffect(() => {
    if (!showWhenRandomQueryParam) {
      return;
    }

    const isRandomNavigation =
      new URLSearchParams(window.location.search).get("random") === "true";

    setShouldRender(isRandomNavigation);
  }, [showWhenRandomQueryParam]);

  const availableSlugs = currentSlug
    ? slugs.filter((slug) => slug !== currentSlug)
    : slugs;

  if (!shouldRender) {
    return null;
  }

  return (
    <Button
      type="button"
      className={className}
      aria-label="Go to a random collocation"
      disabled={availableSlugs.length === 0}
      onClick={() => {
        const randomSlug =
          availableSlugs[Math.floor(Math.random() * availableSlugs.length)];

        if (!randomSlug) {
          return;
        }

        const url = new URL(`/${randomSlug}`, window.location.origin);
        url.searchParams.set("random", "true");

        window.location.assign(url);
      }}>
      <DiceThreeIcon />
      {label}
    </Button>
  );
}
