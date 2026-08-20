"use client";

import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  FolderKanban,
  FileText,
  GraduationCap,
  ImageIcon,
  LayoutDashboard,
  Link2,
  Mail,
  Menu,
  MessageSquare,
  Palette,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useMemo,
  useState,
  type ComponentType,
  type Dispatch,
  type SetStateAction,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";

type NavLeaf = {
  label: string;
  href: string;
  icon?: ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
};

type NavItem = NavLeaf & {
  children?: NavLeaf[];
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const adminNavGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    items: [
      { label: "Profile", href: "/admin/profile", icon: UserRound },
      { label: "CV", href: "/admin/cv", icon: FileText },
      { label: "Experience", href: "/admin/experiences", icon: BriefcaseBusiness },
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "Skills", href: "/admin/skills", icon: Sparkles },
      { label: "Certifications", href: "/admin/certifications", icon: Award },
      { label: "Education", href: "/admin/education", icon: GraduationCap },
      { label: "Blog", href: "/admin/blog", icon: BookOpen },
    ],
  },
  {
    id: "outreach",
    label: "Outreach",
    items: [
      { label: "Messages", href: "/admin/contact-messages", icon: MessageSquare },
      { label: "Chat sessions", href: "/admin/chat-sessions", icon: Mail },
      {
        label: "Job applications",
        href: "/admin/job-applications",
        icon: Send,
        children: [
          { label: "All applications", href: "/admin/job-applications" },
          { label: "New application", href: "/admin/job-applications/new" },
        ],
      },
    ],
  },
  {
    id: "site",
    label: "Site",
    items: [
      { label: "Themes", href: "/admin/themes", icon: Palette },
      { label: "Social links", href: "/admin/social-links", icon: Link2 },
      { label: "Uses", href: "/admin/uses", icon: Wrench },
      { label: "Media", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

const ALL_GROUP_IDS = adminNavGroups.map((group) => group.id);

function pathMatches(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupContainsPath(group: NavGroup, pathname: string) {
  return group.items.some(
    (item) =>
      pathMatches(pathname, item.href) ||
      item.children?.some((child) => pathMatches(pathname, child.href)),
  );
}

function itemsForPath(pathname: string) {
  const next = new Set<string>();
  for (const group of adminNavGroups) {
    for (const item of group.items) {
      if (
        item.children?.length &&
        (pathMatches(pathname, item.href) ||
          item.children.some((child) => pathMatches(pathname, child.href)))
      ) {
        next.add(item.href);
      }
    }
  }
  return next;
}

export function AdminSidebarMobileTrigger({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Button
      aria-expanded={open}
      aria-label="Toggle admin navigation"
      className="lg:hidden"
      onClick={() => onOpenChange((value) => !value)}
      size="icon"
      type="button"
      variant="ghost"
    >
      {open ? <X aria-hidden size={18} /> : <Menu aria-hidden size={18} />}
    </Button>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  nested,
  onNavigate,
}: {
  href: string;
  label: string;
  icon?: NavLeaf["icon"];
  active: boolean;
  collapsed: boolean;
  nested?: boolean;
  onNavigate: () => void;
}) {
  const link = (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "group/link relative flex items-center gap-2.5 rounded-[var(--radius-control)] text-sm transition-colors",
        nested ? "px-2.5 py-1.5" : "px-2.5 py-2",
        collapsed && "justify-center px-0",
        active
          ? "bg-[var(--surface)] font-medium text-[var(--accent)]"
          : "text-[var(--foreground)]/85 hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
      )}
      href={href}
      onClick={onNavigate}
    >
      {active && !collapsed ? (
        <span
          aria-hidden
          className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--accent)]"
        />
      ) : null}
      {Icon ? (
        <Icon
          aria-hidden
          className={cn("shrink-0", active ? "opacity-100" : "opacity-70")}
          size={nested ? 14 : 17}
        />
      ) : null}
      {!collapsed ? <span className="truncate">{label}</span> : null}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function AdminSidebar({
  collapsed,
  mobileOpen,
  onMobileOpenChange,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(ALL_GROUP_IDS),
  );
  const [openItems, setOpenItems] = useState<Set<string>>(() =>
    itemsForPath(pathname),
  );
  const [syncedPath, setSyncedPath] = useState(pathname);

  if (syncedPath !== pathname) {
    setSyncedPath(pathname);
    setOpenGroups((prev) => {
      const next = new Set(prev);
      for (const group of adminNavGroups) {
        if (groupContainsPath(group, pathname)) next.add(group.id);
      }
      return next;
    });
    setOpenItems((prev) => {
      const next = new Set(prev);
      for (const href of itemsForPath(pathname)) next.add(href);
      return next;
    });
  }

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return adminNavGroups;

    return adminNavGroups
      .map((group) => ({
        ...group,
        items: group.items
          .map((item) => {
            const itemHit = item.label.toLowerCase().includes(q);
            const children = item.children?.filter((child) =>
              child.label.toLowerCase().includes(q),
            );
            if (itemHit || (children && children.length > 0)) {
              return {
                ...item,
                children: itemHit ? item.children : children,
              };
            }
            return null;
          })
          .filter(Boolean) as NavItem[],
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  const searching = query.trim().length > 0;

  function toggleGroup(id: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleItem(href: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }

  function closeMobile() {
    onMobileOpenChange(false);
  }

  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Close admin navigation"
          className="fixed inset-0 z-30 bg-black/45 lg:hidden"
          onClick={closeMobile}
          type="button"
        />
      ) : null}

      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 flex flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width,transform] duration-200 ease-out",
          "h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)]",
          collapsed ? "lg:w-16" : "lg:w-64",
          "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {!collapsed ? (
          <div className="shrink-0 border-b border-[var(--border)] p-3">
            <label className="relative block">
              <span className="sr-only">Search navigation</span>
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[var(--muted)]"
              />
              <Input
                className="h-9 pl-9 text-sm"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search menu…"
                value={query}
              />
            </label>
          </div>
        ) : null}

        <nav
          aria-label="Administration"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3"
        >
          <div className="space-y-4">
            {filteredGroups.map((group) => {
              const groupOpen = searching || openGroups.has(group.id);

              return (
                <div key={group.id}>
                  {!collapsed ? (
                    <button
                      aria-expanded={groupOpen}
                      className="mb-1 flex w-full items-center justify-between gap-2 rounded-[var(--radius-control)] px-2.5 py-1 text-left text-[11px] font-semibold tracking-wide text-[var(--muted)] uppercase transition-colors hover:text-[var(--foreground)]"
                      onClick={() => {
                        if (!searching) toggleGroup(group.id);
                      }}
                      type="button"
                    >
                      {group.label}
                      <ChevronRight
                        aria-hidden
                        className={cn(
                          "size-3.5 shrink-0 transition-transform duration-200",
                          groupOpen && "rotate-90",
                        )}
                      />
                    </button>
                  ) : (
                    <div
                      aria-hidden
                      className="mx-auto mb-2 h-px w-6 bg-[var(--border)]"
                    />
                  )}

                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-200 ease-out",
                      groupOpen || collapsed ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const children = item.children?.length
                            ? item.children
                            : undefined;
                          const itemOpen =
                            searching ||
                            Boolean(children && openItems.has(item.href));
                          const childActive = children?.some((child) =>
                            child.href === item.href
                              ? pathname === child.href
                              : pathMatches(pathname, child.href),
                          );
                          const active =
                            pathMatches(pathname, item.href) ||
                            Boolean(childActive);

                          return (
                            <div key={item.href}>
                              <div className="flex items-center gap-0.5">
                                <div className="min-w-0 flex-1">
                                  <NavLink
                                    active={active}
                                    collapsed={collapsed}
                                    href={item.href}
                                    icon={Icon}
                                    label={item.label}
                                    onNavigate={closeMobile}
                                  />
                                </div>
                                {children && !collapsed ? (
                                  <button
                                    aria-expanded={itemOpen}
                                    aria-label={`Toggle ${item.label} submenu`}
                                    className="rounded-[var(--radius-control)] p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]"
                                    onClick={() => toggleItem(item.href)}
                                    type="button"
                                  >
                                    <ChevronRight
                                      aria-hidden
                                      className={cn(
                                        "size-3.5 transition-transform duration-200",
                                        itemOpen && "rotate-90",
                                      )}
                                    />
                                  </button>
                                ) : null}
                              </div>

                              {children && itemOpen && !collapsed ? (
                                <div className="mt-0.5 mb-1 ml-4 space-y-0.5 border-l border-[var(--border)] pl-2">
                                  {children.map((child) => {
                                    const exact =
                                      child.href === item.href
                                        ? pathname === child.href
                                        : pathMatches(pathname, child.href);
                                    return (
                                      <NavLink
                                        active={exact}
                                        collapsed={false}
                                        href={child.href}
                                        icon={
                                          child.href.endsWith("/new")
                                            ? Plus
                                            : undefined
                                        }
                                        key={`${item.href}-${child.href}-${child.label}`}
                                        label={child.label}
                                        nested
                                        onNavigate={closeMobile}
                                      />
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredGroups.length === 0 ? (
              <p className="px-2.5 py-6 text-center text-sm text-[var(--muted)]">
                No matches for “{query.trim()}”
              </p>
            ) : null}
          </div>
        </nav>

        {!collapsed ? (
          <div className="shrink-0 border-t border-[var(--border)] px-3 py-2.5">
            <p className="text-[11px] leading-4 text-[var(--muted)]">
              Scroll for more · collapse from the header
            </p>
          </div>
        ) : null}
      </aside>
    </>
  );
}
