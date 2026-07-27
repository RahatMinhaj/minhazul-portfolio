"use client";

import { createContext, useContext } from "react";

import { themeIds, type ThemeId } from "@/config/themes";

const ThemeAvailabilityContext = createContext<readonly ThemeId[]>(themeIds);

export function ThemeAvailabilityProvider({
  children,
  themes,
}: {
  children: React.ReactNode;
  themes: readonly ThemeId[];
}) {
  return (
    <ThemeAvailabilityContext value={themes}>
      {children}
    </ThemeAvailabilityContext>
  );
}

export function useAvailableThemes() {
  return useContext(ThemeAvailabilityContext);
}
