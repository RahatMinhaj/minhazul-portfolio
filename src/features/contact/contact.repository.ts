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

  findMany(params: {
    search: string | undefined;
    status: string | undefined;
    page: number;
    pageSize: number;
  }) {
    const where: Record<string, unknown> = {};
    if (params.status && params.status !== "all") {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { subject: { contains: params.search, mode: "insensitive" } },
        { message: { contains: params.search, mode: "insensitive" } },
      ];
    }
    return getDatabase().contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    });
  },

  count(params: { search: string | undefined; status: string | undefined }) {
    const where: Record<string, unknown> = {};
    if (params.status && params.status !== "all") {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { subject: { contains: params.search, mode: "insensitive" } },
        { message: { contains: params.search, mode: "insensitive" } },
      ];
    }
    return getDatabase().contactMessage.count({ where });
  },
};
