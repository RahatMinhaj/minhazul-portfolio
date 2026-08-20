import {
  AdminBreadcrumbs,
  type AdminBreadcrumbItem,
} from "@/components/admin/admin-breadcrumbs";

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description: string;
  breadcrumbs?: AdminBreadcrumbItem[];
  actions?: React.ReactNode;
}) {
  const crumbs =
    breadcrumbs ??
    ([
      { label: "Admin", href: "/admin" },
      { label: title },
    ] satisfies AdminBreadcrumbItem[]);

  return (
    <header className="mb-8">
      <AdminBreadcrumbs items={crumbs} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
