import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { taxonomyRepository } from "@/features/taxonomy/taxonomy.repository";

export function saveSkillCategory(
  id: string,
  data: Prisma.SkillCategoryUncheckedCreateInput,
) {
  return taxonomyRepository.saveSkillCategory(id, data);
}

export function saveSkill(id: string, data: Prisma.SkillUncheckedCreateInput) {
  return taxonomyRepository.saveSkill(id, data);
}

export function deleteSkill(id: string) {
  return taxonomyRepository.deleteSkill(id);
}

export function saveSocialLink(
  id: string,
  data: Prisma.SocialLinkUncheckedCreateInput,
) {
  return taxonomyRepository.saveSocialLink(id, data);
}

export function deleteSocialLink(id: string) {
  return taxonomyRepository.deleteSocialLink(id);
}

export function saveUseItem(
  id: string,
  data: Prisma.UseItemUncheckedCreateInput,
) {
  return taxonomyRepository.saveUseItem(id, data);
}

export function deleteUseItem(id: string) {
  return taxonomyRepository.deleteUseItem(id);
}
