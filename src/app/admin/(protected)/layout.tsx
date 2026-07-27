import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { logoutAction } from "@/server/actions/auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-16 max-w-[96rem] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2">
            <AdminNav />
            <Link
              className="flex items-center gap-2 font-semibold"
              href="/admin"
            >
              <ShieldCheck
                className="text-[var(--accent)]"
                aria-hidden
                size={18}
              />
              Admin console
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[var(--muted)] sm:inline">
              {admin.name}
            </span>
            <form action={logoutAction}>
              <Button size="sm" type="submit" variant="ghost">
                <LogOut aria-hidden size={15} />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="lg:pl-72">{children}</div>
    </div>
  );
}
