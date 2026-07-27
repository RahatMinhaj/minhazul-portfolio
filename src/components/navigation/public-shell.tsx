"use client";

import { useCallback, useState } from "react";

import { CommandPalette } from "@/components/navigation/command-palette";
import { SiteHeader } from "@/components/navigation/site-header";
import { ThemeAvailabilityProvider } from "@/components/themes/theme-availability";
import type { ThemeId } from "@/config/themes";

export function PublicShell({
  children,
  projectCommands,
  socialCommands,
  availableThemes,
}: {
  children: React.ReactNode;
  projectCommands: Array<{ label: string; href: string }>;
  socialCommands: Array<{ label: string; href: string }>;
  availableThemes: readonly ThemeId[];
}) {
  const [commandOpen, setCommandOpen] = useState(false);
  const handleCommandOpenChange = useCallback(
    (open: boolean) => setCommandOpen(open),
    [],
  );

  return (
    <ThemeAvailabilityProvider themes={availableThemes}>
      <SiteHeader onOpenCommandPalette={() => setCommandOpen(true)} />
      {children}
      <CommandPalette
        onOpenChange={handleCommandOpenChange}
        open={commandOpen}
        projectCommands={projectCommands}
        socialCommands={socialCommands}
      />
    </ThemeAvailabilityProvider>
  );
}
