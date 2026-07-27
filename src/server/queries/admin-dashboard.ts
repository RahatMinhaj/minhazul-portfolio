import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import { getAdminDashboardData } from "@/server/repositories/admin-dashboard.repository";

export async function getAdminDashboard() {
  await requireAdmin();
  return getAdminDashboardData();
}
