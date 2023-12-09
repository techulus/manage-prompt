"use client";

import { useEffect } from "react";
import { useCookies } from "react-cookie";
import usePrefersColorScheme from "./usePrefersColorScheme";

export const useTheme = (): "dark" | "light" => {
  const [cookies, setCookie] = useCookies(["theme"]);
  const colorScheme = usePrefersColorScheme();

  useEffect(() => {
    if (colorScheme == "no-preference") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(colorScheme);
    setCookie("theme", colorScheme, { path: "/" });
  }, [colorScheme, setCookie]);

  return colorScheme == "no-preference"
    ? cookies.theme ?? "light"
    : colorScheme;
};
