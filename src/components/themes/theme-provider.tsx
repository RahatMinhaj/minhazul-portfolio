"use client";

import { useServerInsertedHTML } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  defaultTheme as fallbackTheme,
  themeIds,
  type ThemeId,
} from "@/config/themes";

const STORAGE_KEY = "portfolio-theme-v2";

type ThemeContextValue = {
  theme: ThemeId | undefined;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeId[];
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemeId(value: string | null | undefined): value is ThemeId {
  return Boolean(value && themeIds.includes(value as ThemeId));
}

function buildThemeInitScript(storageKey: string, defaultTheme: ThemeId) {
  return `(function(){try{var key=${JSON.stringify(storageKey)};var fallback=${JSON.stringify(defaultTheme)};var allowed=${JSON.stringify(themeIds)};var theme=localStorage.getItem(key)||fallback;if(allowed.indexOf(theme)===-1)theme=fallback;document.documentElement.setAttribute("data-theme",theme)}catch(e){document.documentElement.setAttribute("data-theme",${JSON.stringify(defaultTheme)})}})();`;
}

export function ThemeProvider({
  children,
  defaultTheme = fallbackTheme,
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeId;
}) {
  useServerInsertedHTML(() => (
    <script
      dangerouslySetInnerHTML={{
        __html: buildThemeInitScript(STORAGE_KEY, defaultTheme),
      }}
    />
  ));

  const [theme, setThemeState] = useState<ThemeId | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial = isThemeId(stored) ? stored : defaultTheme;
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, [defaultTheme]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || !isThemeId(event.newValue)) {
        return;
      }

      setThemeState(event.newValue);
      document.documentElement.setAttribute("data-theme", event.newValue);
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore private mode / quota errors.
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes: [...themeIds],
    }),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
