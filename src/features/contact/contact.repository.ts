import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/db/client";

export const contactRepository = {
  countSince(email: string, createdAt: Date) {
    return getDatabase().contactMessage.count({
      where: { email, createdAt: { gte: createdAt } },
    });
  },

  create(data: Prisma.ContactMessageUncheckedCreateInput) {
    return getDatabase().contactMessage.create({ data });
  },
};
