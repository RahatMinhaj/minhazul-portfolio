import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/db/client";

export function upsertMediaAsset(
  url: string,
  data: Prisma.MediaAssetUncheckedCreateInput,
) {
  return getDatabase().mediaAsset.upsert({
    where: { url },
    create: data,
    update: data,
  });
}
