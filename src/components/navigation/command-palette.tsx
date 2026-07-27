"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ExternalLink,
  FileText,
  FolderKanban,
  MoonStar,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAvailableThemes } from "@/components/themes/theme-availability";
import { publicNavigation } from "@/config/navigation";
import { themeDefinitions } from "@/config/themes";

export function CommandPalette({
  open,
  onOpenChange,
  projectCommands,
  socialCommands,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectCommands: Array<{ label: string; href: string }>;
  socialCommands: Array<{ label: string; href: string }>;
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { setTheme } = useTheme();
  const availableThemes = useAvailableThemes();

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [onOpenChange, open]);

  const normalizedQuery = query.trim().toLowerCase();
  const routes = useMemo(
    () =>
      publicNavigation.filter((item) =>
        item.label.toLowerCase().includes(normalizedQuery),
      ),
    [normalizedQuery],
  );
  const themes = useMemo(
    () =>
      themeDefinitions.filter(
        (item) =>
          availableThemes.includes(item.id) &&
          item.name.toLowerCase().includes(normalizedQuery),
      ),
    [availableThemes, normalizedQuery],
  );
  const projects = projectCommands.filter((item) =>
    item.label.toLowerCase().includes(normalizedQuery),
  );
  const socials = socialCommands.filter((item) =>
    item.label.toLowerCase().includes(normalizedQuery),
  );

  function navigate(href: string) {
    router.push(href);
    onOpenChange(false);
    setQuery("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Navigate the portfolio or change its visual theme.
        </DialogDescription>
        <DialogPrimitive.Close
          className="absolute top-4 right-4 z-10 rounded-full p-2 text-[var(--muted)] hover:text-[var(--foreground)]"
          aria-label="Close command palette"
        >
          <X aria-hidden size={17} />
        </DialogPrimitive.Close>
        <label className="flex items-center gap-3 border-b border-[var(--border)] px-5">
          <Search className="text-[var(--muted)]" aria-hidden size={18} />
          <span className="sr-only">Search commands</span>
          <input
            autoFocus
            className="h-16 w-full bg-transparent pr-10 text-sm outline-none placeholder:text-[var(--muted)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Navigate or change theme…"
            value={query}
          />
        </label>
        <div className="max-h-[55dvh] overflow-y-auto p-2">
          <CommandGroup label="Navigate">
            {routes.map((item) => (
              <CommandItem
                icon={<FileText aria-hidden size={16} />}
                key={item.href}
                label={item.label}
                onSelect={() => navigate(item.href)}
              />
            ))}
          </CommandGroup>
          <CommandGroup label="Themes">
            {themes.map((item) => (
              <CommandItem
                icon={<MoonStar aria-hidden size={16} />}
                key={item.id}
                label={item.name}
                onSelect={() => {
                  setTheme(item.id);
                  onOpenChange(false);
                  setQuery("");
                }}
              />
            ))}
          </CommandGroup>
          {projects.length ? (
            <CommandGroup label="Projects">
              {projects.map((item) => (
                <CommandItem
                  icon={<FolderKanban aria-hidden size={16} />}
                  key={item.href}
                  label={item.label}
                  onSelect={() => navigate(item.href)}
                />
              ))}
            </CommandGroup>
          ) : null}
          {socials.length ? (
            <CommandGroup label="Profiles">
              {socials.map((item) => (
                <CommandItem
                  icon={<ExternalLink aria-hidden size={16} />}
                  key={item.href}
                  label={item.label}
                  onSelect={() => {
                    window.open(item.href, "_blank", "noopener,noreferrer");
                    onOpenChange(false);
                  }}
                />
              ))}
            </CommandGroup>
          ) : null}
          {routes.length === 0 &&
          themes.length === 0 &&
          projects.length === 0 &&
          socials.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--muted)]">
              No matching command.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CommandGroup({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="mb-2">
      <p className="px-3 py-2 font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

function CommandItem({
  icon,
  label,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-3 text-left text-sm text-[var(--muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)] focus:bg-[var(--surface-raised)]"
      onClick={onSelect}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
