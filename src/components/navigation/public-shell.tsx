"use client";

import { useCallback, useState } from "react";

import { CommandPalette } from "@/components/navigation/command-palette";
import { SiteHeader } from "@/components/navigation/site-header";
import { ThemeAvailabilityProvider } from "@/components/themes/theme-availability";
import type { PublicNavigationItem } from "@/config/navigation";
import type { ThemeId } from "@/config/themes";

export function PublicShell({
  children,
  projectCommands,
  socialCommands,
  availableThemes,
  navigation,
  siteName,
}: {
  children: React.ReactNode;
  projectCommands: Array<{ label: string; href: string }>;
  socialCommands: Array<{ label: string; href: string }>;
  availableThemes: readonly ThemeId[];
  navigation: readonly PublicNavigationItem[];
  siteName: string;
}) {
  const [commandOpen, setCommandOpen] = useState(false);
  const handleCommandOpenChange = useCallback(
    (open: boolean) => setCommandOpen(open),
    [],
  );

  return (
    <ThemeAvailabilityProvider themes={availableThemes}>
      <SiteHeader
        navigation={navigation}
        onOpenCommandPalette={() => setCommandOpen(true)}
        siteName={siteName}
      />
      {children}
      <CommandPalette
        onOpenChange={handleCommandOpenChange}
        open={commandOpen}
        navigation={navigation}
        projectCommands={projectCommands}
        socialCommands={socialCommands}
      />
    </ThemeAvailabilityProvider>
  );
}
