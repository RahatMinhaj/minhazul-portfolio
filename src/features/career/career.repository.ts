import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { getDatabase } from "@/lib/db/client";

function saveExperience(
  id: string,
  data: Prisma.ExperienceUncheckedCreateInput,
) {
  return id
    ? getDatabase().experience.update({ where: { id }, data })
    : getDatabase().experience.create({ data });
}

function saveCertification(
  id: string,
  data: Prisma.CertificationUncheckedCreateInput,
) {
  return id
    ? getDatabase().certification.update({ where: { id }, data })
    : getDatabase().certification.create({ data });
}

function saveEducation(id: string, data: Prisma.EducationUncheckedCreateInput) {
  return id
    ? getDatabase().education.update({ where: { id }, data })
    : getDatabase().education.create({ data });
}

export const careerRepository = {
  saveExperience,
  deleteExperience(id: string) {
    return getDatabase().experience.delete({ where: { id } });
  },
  saveCertification,
  deleteCertification(id: string) {
    return getDatabase().certification.delete({ where: { id } });
  },
  saveEducation,
  deleteEducation(id: string) {
    return getDatabase().education.delete({ where: { id } });
  },
};
