"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

import {
  defaultTheme as fallbackTheme,
  themeIds,
  type ThemeId,
} from "@/config/themes";

export function ThemeProvider({
  children,
  defaultTheme = fallbackTheme,
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeId;
}) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      disableTransitionOnChange={false}
      enableColorScheme
      enableSystem={false}
      storageKey="portfolio-theme-v2"
      themes={[...themeIds]}
    >
      {children}
    </NextThemesProvider>
  );
}
