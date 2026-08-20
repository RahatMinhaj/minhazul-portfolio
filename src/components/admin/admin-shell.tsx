"use client";

import Link from "next/link";
import {
  Eye,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from "lucide-react";
import {
  useCallback,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  AdminSidebar,
  AdminSidebarMobileTrigger,
} from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { logoutAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils/cn";

const COLLAPSED_KEY = "admin-sidebar-collapsed";
const collapsedListeners = new Set<() => void>();

function subscribeCollapsed(onStoreChange: () => void) {
  collapsedListeners.add(onStoreChange);
  return () => collapsedListeners.delete(onStoreChange);
}

function getCollapsedSnapshot() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function getCollapsedServerSnapshot() {
  return false;
}

function setCollapsedPreference(next: boolean) {
  try {
    localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
  } catch {
    /* ignore */
  }
  for (const listener of collapsedListeners) listener();
}

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  );

  const toggleCollapsed = useCallback(() => {
    setCollapsedPreference(!getCollapsedSnapshot());
  }, []);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-dvh bg-[color-mix(in_srgb,var(--background)_96%,var(--surface))]">
        {/* Sidebar is a sibling of the header — never nested under backdrop-filter,
            or `position: fixed` gets trapped to the header's h-16. */}
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <AdminSidebarMobileTrigger
                open={mobileOpen}
                onOpenChange={setMobileOpen}
              />
              <Button
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-pressed={collapsed}
                className="hidden lg:inline-flex"
                onClick={toggleCollapsed}
                size="icon"
                type="button"
                variant="ghost"
              >
                {collapsed ? (
                  <PanelLeftOpen aria-hidden size={18} />
                ) : (
                  <PanelLeftClose aria-hidden size={18} />
                )}
              </Button>
              <Link
                className="flex min-w-0 items-center gap-2 font-semibold"
                href="/admin"
              >
                <ShieldCheck
                  aria-hidden
                  className="shrink-0 text-[var(--accent)]"
                  size={18}
                />
                <span className="truncate">Admin console</span>
              </Link>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden max-w-[10rem] truncate text-sm text-[var(--muted)] sm:inline">
                {adminName}
              </span>
              <Button asChild size="sm" variant="ghost">
                <Link href="/" target="_blank">
                  <Eye aria-hidden size={15} />
                  <span className="hidden sm:inline">Preview site</span>
                </Link>
              </Button>
              <form action={logoutAction}>
                <Button size="sm" type="submit" variant="ghost">
                  <LogOut aria-hidden size={15} />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </form>
            </div>
          </div>
        </header>

        <AdminSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />

        <div
          className={cn(
            "min-h-[calc(100dvh-4rem)] transition-[padding] duration-200 ease-out",
            collapsed ? "lg:pl-16" : "lg:pl-64",
          )}
        >
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}
