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
  Send,
  Settings,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const adminNavigation = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Profile", href: "/admin/profile", icon: UserRound },
  { label: "CV", href: "/admin/cv", icon: FileText },
  { label: "Experience", href: "/admin/experiences", icon: BriefcaseBusiness },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Skills", href: "/admin/skills", icon: Sparkles },
  { label: "Certifications", href: "/admin/certifications", icon: Award },
  { label: "Education", href: "/admin/education", icon: GraduationCap },
  { label: "Blog", href: "/admin/blog", icon: BookOpen },
  { label: "Themes", href: "/admin/themes", icon: Palette },
  { label: "Social links", href: "/admin/social-links", icon: Link2 },
  { label: "Messages", href: "/admin/contact-messages", icon: MessageSquare },
  { label: "Chat sessions", href: "/admin/chat-sessions", icon: Mail },
  { label: "Job applications", href: "/admin/job-applications", icon: Send },
  { label: "Uses", href: "/admin/uses", icon: Wrench },
  { label: "Media", href: "/admin/media", icon: ImageIcon },
  { label: "Settings", href: "/admin/settings", icon: Settings },
] as const;

export function AdminNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <Button
        aria-expanded={open}
        aria-label="Toggle admin navigation"
        className="lg:hidden"
        onClick={() => setOpen((value) => !value)}
        size="icon"
        variant="ghost"
      >
        {open ? <X aria-hidden size={18} /> : <Menu aria-hidden size={18} />}
      </Button>
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-30 w-72 overflow-y-auto border-r border-[var(--border)] bg-[var(--surface)] p-4 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav aria-label="Administration">
          <p className="px-3 py-2 font-mono text-[10px] tracking-widest text-[var(--muted)] uppercase">
            Content system
          </p>
          <div className="mt-2 space-y-1">
            {adminNavigation.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm",
                    active
                      ? "bg-[var(--surface-raised)] text-[var(--accent)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  <Icon aria-hidden size={16} />
                  {item.label}
                  <ChevronRight
                    className="ml-auto opacity-40"
                    aria-hidden
                    size={14}
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
