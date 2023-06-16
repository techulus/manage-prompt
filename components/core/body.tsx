"use client";

import { ThemeProvider, useTheme } from "@wits/next-themes";
import classNames from "classnames";
import { ReactNode, useEffect } from "react";

export function Body({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    console.log("theme", theme);
    setTheme("light");
  }, [theme, setTheme]);

  return (
    <ThemeProvider attribute="class">
      <body
        className={classNames(
          "flex-1 min-h-full min-w-full",
          "rounded-tl-xl rounded-tr-xl md:rounded-none"
        )}
      >
        {children}
      </body>
    </ThemeProvider>
  );
}
