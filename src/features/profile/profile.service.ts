import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { profileRepository } from "@/features/profile/profile.repository";

export async function saveProfile(data: Prisma.ProfileUncheckedCreateInput) {
  const current = await profileRepository.findIdentity();

  return current
    ? profileRepository.update(current.id, data)
    : profileRepository.create(data);
}
