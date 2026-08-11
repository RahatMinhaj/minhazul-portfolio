import Link from "next/link";

import type { PublicNavigationItem } from "@/config/navigation";

export function SiteFooter({
  footerText,
  navigation,
  siteName,
}: {
  footerText?: string | null | undefined;
  navigation: readonly PublicNavigationItem[];
  siteName: string;
}) {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto grid max-w-[88rem] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-12">
        <div>
          <p className="font-mono text-sm">{siteName}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            {footerText ??
              "Full-stack Java engineer building dependable enterprise systems, distributed platforms, and applied AI solutions."}
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3"
        >
          {navigation.slice(1).map((item) => (
            <Link
              className="text-[var(--muted)] hover:text-[var(--foreground)]"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="font-mono text-xs text-[var(--muted)] lg:col-span-2">
          © {new Date().getFullYear()} {siteName}. Built with Next.js and
          PostgreSQL.
        </p>
      </div>
    </footer>
  );
}
