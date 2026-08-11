"use client";

import { AnimatePresence, motion } from "motion/react";
import { Command, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeSelector } from "@/components/themes/theme-selector";
import { Button } from "@/components/ui/button";
import type { PublicNavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";

export function SiteHeader({
  navigation,
  onOpenCommandPalette,
  siteName,
}: {
  navigation: readonly PublicNavigationItem[];
  onOpenCommandPalette: () => void;
  siteName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[88rem] items-center gap-4 px-5 sm:px-8 lg:px-12">
        <Link
          className="mr-auto flex items-center gap-2 font-mono text-sm font-semibold"
          href="/"
          onClick={() => setMenuOpen(false)}
        >
          <span className="grid size-7 place-items-center rounded-[var(--radius-control)] border border-[var(--border-strong)] text-[var(--accent)]">
            M
          </span>
          <span className="hidden sm:inline">{siteName}</span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-0.5 xl:flex"
        >
          {navigation
            .filter((item) => item.primary)
            .map((item) => (
              <NavLink
                active={
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                }
                href={item.href}
                key={item.href}
                label={item.label}
              />
            ))}
        </nav>

        <Button
          aria-label="Open command palette"
          onClick={onOpenCommandPalette}
          size="sm"
          variant="ghost"
        >
          <Command aria-hidden size={16} />
          <span className="hidden sm:inline">Command</span>
          <kbd className="hidden rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)] lg:inline">
            ⌘K
          </kbd>
        </Button>
        <div className="hidden sm:block">
          <ThemeSelector />
        </div>
        <Button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          className="xl:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          size="icon"
          variant="ghost"
        >
          {menuOpen ? (
            <X aria-hidden size={18} />
          ) : (
            <Menu aria-hidden size={18} />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            animate={{ height: "auto", opacity: 1 }}
            aria-label="Mobile navigation"
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-[var(--border)] bg-[var(--background)] xl:hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
          >
            <div className="mx-auto grid max-w-[88rem] gap-1 px-5 py-5 sm:grid-cols-2 sm:px-8 lg:px-12">
              {navigation.map((item, index) => (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: -8 }}
                  key={item.href}
                  transition={{ delay: index * 0.025 }}
                >
                  <Link
                    aria-current={
                      item.href === "/"
                        ? pathname === "/"
                          ? "page"
                          : undefined
                        : pathname.startsWith(item.href)
                          ? "page"
                          : undefined
                    }
                    className={cn(
                      "block rounded-[var(--radius-control)] px-4 py-3 text-sm",
                      item.href === "/"
                        ? pathname === "/"
                          ? "bg-[var(--surface-raised)] text-[var(--accent)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]"
                        : pathname.startsWith(item.href)
                          ? "bg-[var(--surface-raised)] text-[var(--accent)]"
                          : "text-[var(--muted)] hover:text-[var(--foreground)]",
                    )}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="mr-3 font-mono text-xs opacity-55">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-3 sm:hidden">
                <ThemeSelector />
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  active,
  href,
  label,
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-md px-2.5 py-2 text-xs transition-colors",
        active
          ? "text-[var(--foreground)]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]",
      )}
      href={href}
    >
      {label}
      {active ? (
        <motion.span
          className="absolute right-2.5 bottom-0 left-2.5 h-px bg-[var(--accent)]"
          layoutId="active-navigation"
        />
      ) : null}
    </Link>
  );
}
