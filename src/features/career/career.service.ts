import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { careerRepository } from "@/features/career/career.repository";
import type {
  CertificationWriteInput,
  EducationWriteInput,
  ExperienceWriteInput,
} from "@/features/career/career-types";
import type { RichTextDocument } from "@/lib/content/rich-text";

function toNullableJson(
  value: RichTextDocument | null,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return value ? (value as Prisma.InputJsonValue) : Prisma.DbNull;
}

export function saveExperience(id: string, input: ExperienceWriteInput) {
  const data: Prisma.ExperienceUncheckedCreateInput = {
    company: input.company,
    position: input.position,
    location: input.location,
    richDescription: toNullableJson(input.richDescription),
    startDate: input.startDate,
    endDate: input.endDate,
    currentlyWorking: input.currentlyWorking,
    achievements: input.achievements,
    technologies: input.technologies,
    sortOrder: input.sortOrder,
    featured: input.featured,
    visible: input.visible,
  };
  return careerRepository.saveExperience(id, data);
}

export function deleteExperience(id: string) {
  return careerRepository.deleteExperience(id);
}

export function saveCertification(id: string, input: CertificationWriteInput) {
  const data: Prisma.CertificationUncheckedCreateInput = {
    name: input.name,
    issuer: input.issuer,
    credentialId: input.credentialId,
    credentialUrl: input.credentialUrl,
    certificateImage: input.certificateImage,
    category: input.category,
    description: input.description,
    issueDate: input.issueDate,
    expiryDate: input.expiryDate,
    sortOrder: input.sortOrder,
    featured: input.featured,
    visible: input.visible,
  };
  return careerRepository.saveCertification(id, data);
}

export function deleteCertification(id: string) {
  return careerRepository.deleteCertification(id);
}

export function saveEducation(id: string, input: EducationWriteInput) {
  const data: Prisma.EducationUncheckedCreateInput = {
    institution: input.institution,
    degree: input.degree,
    field: input.field,
    grade: input.grade,
    logo: input.logo,
    description: toNullableJson(input.description),
    startDate: input.startDate,
    endDate: input.endDate,
    sortOrder: input.sortOrder,
    visible: input.visible,
  };
  return careerRepository.saveEducation(id, data);
}

export function deleteEducation(id: string) {
  return careerRepository.deleteEducation(id);
}
