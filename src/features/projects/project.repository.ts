import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/db/client";

export const projectRepository = {
  save(id: string, data: Prisma.ProjectUncheckedCreateInput) {
    return id
      ? getDatabase().project.update({ where: { id }, data })
      : getDatabase().project.create({ data });
  },

  delete(id: string) {
    return getDatabase().project.delete({ where: { id } });
  },
};
