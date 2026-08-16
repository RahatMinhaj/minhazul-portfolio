import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/db/client";

export function createMediaAsset(data: Prisma.MediaAssetUncheckedCreateInput) {
  return getDatabase().mediaAsset.create({ data });
}

export function getMediaAsset(id: string) {
  return getDatabase().mediaAsset.findUnique({ where: { id } });
}

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
