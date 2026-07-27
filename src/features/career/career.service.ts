import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { careerRepository } from "@/features/career/career.repository";

export function saveExperience(
  id: string,
  data: Prisma.ExperienceUncheckedCreateInput,
) {
  return careerRepository.saveExperience(id, data);
}

export function deleteExperience(id: string) {
  return careerRepository.deleteExperience(id);
}

export function saveCertification(
  id: string,
  data: Prisma.CertificationUncheckedCreateInput,
) {
  return careerRepository.saveCertification(id, data);
}

export function deleteCertification(id: string) {
  return careerRepository.deleteCertification(id);
}

export function saveEducation(
  id: string,
  data: Prisma.EducationUncheckedCreateInput,
) {
  return careerRepository.saveEducation(id, data);
}

export function deleteEducation(id: string) {
  return careerRepository.deleteEducation(id);
}
