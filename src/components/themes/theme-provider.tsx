"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

import { defaultTheme, themeIds } from "@/config/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={defaultTheme}
      disableTransitionOnChange={false}
      enableColorScheme
      enableSystem={false}
      storageKey="portfolio-theme"
      themes={[...themeIds]}
    >
      {children}
    </NextThemesProvider>
  );
}
