import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const systemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const set = document.documentElement.dataset.theme;
    return set === "light" || set === "dark" ? set : systemTheme();
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("roamly-theme", next);
      } catch {
        /* storage unavailable: the choice just won't persist */
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
