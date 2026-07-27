import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/db/client";

export const blogRepository = {
  findPublication(id: string) {
    return getDatabase().blogPost.findUnique({
      where: { id },
      select: { publishedAt: true },
    });
  },

  save(id: string, data: Prisma.BlogPostUncheckedCreateInput) {
    return id
      ? getDatabase().blogPost.update({ where: { id }, data })
      : getDatabase().blogPost.create({ data });
  },

  delete(id: string) {
    return getDatabase().blogPost.delete({ where: { id } });
  },
};
