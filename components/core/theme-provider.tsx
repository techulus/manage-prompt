"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    // @ts-ignore
    <NextThemesProvider attribute="class" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
