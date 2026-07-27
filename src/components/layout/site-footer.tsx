import Link from "next/link";

import { publicNavigation } from "@/config/navigation";

export function SiteFooter({
  footerText,
}: {
  footerText?: string | null | undefined;
}) {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto grid max-w-[96rem] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_auto] lg:px-10">
        <div>
          <p className="font-mono text-sm">portfolio.dev</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
            {footerText ??
              "Professional details are shown only after verification. No invented work history, projects, metrics, or credentials."}
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3"
        >
          {publicNavigation.slice(1).map((item) => (
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
          © {new Date().getFullYear()} · Owner details need confirmation.
        </p>
      </div>
    </footer>
  );
}
