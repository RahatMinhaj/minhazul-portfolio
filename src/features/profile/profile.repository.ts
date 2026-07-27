import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/db/client";

export const profileRepository = {
  findIdentity() {
    return getDatabase().profile.findFirst({ select: { id: true } });
  },

  create(data: Prisma.ProfileUncheckedCreateInput) {
    return getDatabase().profile.create({ data });
  },

  update(id: string, data: Prisma.ProfileUncheckedUpdateInput) {
    return getDatabase().profile.update({ where: { id }, data });
  },
};
