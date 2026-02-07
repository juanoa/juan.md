import { LaptopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";

  const storedTheme = window.localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return "system";
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = theme === "dark" || (theme === "system" && prefersDark);

  document.documentElement.classList.toggle("dark", isDark);

  if (theme === "system") {
    window.localStorage.removeItem("theme");
    return;
  }

  window.localStorage.setItem("theme", theme);
}

export function ThemeTabs() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      document.documentElement.classList.toggle("dark", mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <>
      <Tabs
        value={theme}
        onValueChange={(value) => setTheme(value as Theme)}
        className="hidden lg:block"
      >
        <TabsList>
          <TabsTrigger value="system" aria-label="System theme">
            <LaptopIcon />
          </TabsTrigger>
          <TabsTrigger value="light" aria-label="Light theme">
            <SunIcon />
          </TabsTrigger>
          <TabsTrigger value="dark" aria-label="Dark theme">
            <MoonIcon />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
}
