import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/db/client";

export const authRepository = {
  findAdministratorByEmail(email: string) {
    return getDatabase().user.findUnique({ where: { email } });
  },

  findAttempt(keyHash: string) {
    return getDatabase().authAttempt.findUnique({ where: { keyHash } });
  },

  upsertAttempt(
    keyHash: string,
    create: Prisma.AuthAttemptUncheckedCreateInput,
    update: Prisma.AuthAttemptUncheckedUpdateInput,
  ) {
    return getDatabase().authAttempt.upsert({
      where: { keyHash },
      create,
      update,
    });
  },

  clearAttempts(keyHash: string) {
    return getDatabase().authAttempt.deleteMany({ where: { keyHash } });
  },

  createSession(data: Prisma.AdminSessionUncheckedCreateInput) {
    return getDatabase().adminSession.create({ data });
  },

  findSession(tokenHash: string) {
    return getDatabase().adminSession.findUnique({
      where: { tokenHash },
      select: {
        expiresAt: true,
        revokedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            active: true,
          },
        },
      },
    });
  },

  revokeSession(tokenHash: string, revokedAt: Date) {
    return getDatabase().adminSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt },
    });
  },
};
