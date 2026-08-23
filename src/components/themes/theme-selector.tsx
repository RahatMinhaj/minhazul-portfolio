"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Palette, X } from "lucide-react";
import { useTheme } from "@/components/themes/theme-provider";
import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { useAvailableThemes } from "@/components/themes/theme-availability";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { themeDefinitions, type ThemeId } from "@/config/themes";
import { cn } from "@/lib/utils/cn";

export function ThemeSelector() {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const availableThemes = useAvailableThemes();
  const reduceMotion = useReducedMotion();

  const activeTheme = mounted ? theme : undefined;

  function selectTheme(themeId: ThemeId) {
    setTheme(themeId);
    if (!reduceMotion) {
      document.documentElement.animate(
        [
          { filter: "brightness(1)" },
          { filter: "brightness(1.14)" },
          { filter: "brightness(1)" },
        ],
        { duration: 360, easing: "ease-out" },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-label="Choose visual theme" size="sm" variant="outline">
          <Palette aria-hidden size={16} />
          Themes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogPrimitive.Close
          className="absolute top-4 right-4 rounded-full p-2 text-[var(--muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]"
          aria-label="Close theme selector"
        >
          <X aria-hidden size={18} />
        </DialogPrimitive.Close>
        <DialogHeader>
          <DialogTitle>Choose an interface</DialogTitle>
          <DialogDescription>
            Each option changes typography, surfaces, depth, decoration, and
            motion character—not only color.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {themeDefinitions
            .filter((item) => availableThemes.includes(item.id))
            .map((item) => {
              const isActive = activeTheme === item.id;

              return (
                <button
                  key={item.id}
                  className={cn(
                    "group relative overflow-hidden rounded-[var(--radius-card)] border p-4 text-left transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5",
                    isActive
                      ? "border-[var(--accent)] shadow-[var(--shadow-glow)]"
                      : "border-[var(--border)] hover:border-[var(--border-strong)]",
                  )}
                  onClick={() => selectTheme(item.id)}
                  type="button"
                >
                  <ThemeSwatch themeId={item.id} />
                  <span className="mt-4 flex items-start justify-between gap-3">
                    <span>
                      <span className="block font-medium">{item.name}</span>
                      <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">
                        {item.description}
                      </span>
                    </span>
                    <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-[var(--border-strong)]">
                      <AnimatePresence>
                        {isActive ? (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.4 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.4 }}
                            className="absolute inset-0 grid place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]"
                          >
                            <Check aria-hidden size={13} strokeWidth={3} />
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </span>
                  </span>
                </button>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ThemeSwatch({ themeId }: { themeId: ThemeId }) {
  return (
    <span
      className="theme-swatch block h-24 overflow-hidden rounded-xl border border-white/10"
      data-preview-theme={themeId}
      aria-hidden
    >
      <span className="theme-swatch-grid" />
      <span className="theme-swatch-card">
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}
