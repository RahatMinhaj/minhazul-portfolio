import "server-only";

import { getDatabase, isDatabaseConfigured } from "@/lib/db/client";

export async function getCandidateProfile() {
  if (!isDatabaseConfigured()) return null;

  return getDatabase().profile.findFirst({
    select: {
      fullName: true,
      professionalTitle: true,
      shortBio: true,
      email: true,
      location: true,
      yearsOfExperience: true,
      currentCompany: true,
      currentRole: true,
      currentFocus: true,
    },
  });
}

export async function getCandidateExperiences() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().experience.findMany({
    where: { visible: true },
    orderBy: [
      { currentlyWorking: "desc" },
      { sortOrder: "asc" },
      { startDate: "desc" },
    ],
    select: {
      position: true,
      company: true,
      richDescription: true,
      achievements: true,
      technologies: true,
    },
  });
}

export async function getCandidateProjects() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().project.findMany({
    where: { visible: true },
    orderBy: [
      { featured: "desc" },
      { sortOrder: "asc" },
      { updatedAt: "desc" },
    ],
    select: {
      title: true,
      shortDescription: true,
      technologies: true,
    },
  });
}

export async function getCandidateSkillCategories() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().skillCategory.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      name: true,
      skills: {
        where: { visible: true },
        orderBy: [
          { highlighted: "desc" },
          { sortOrder: "asc" },
          { name: "asc" },
        ],
        select: {
          name: true,
          highlighted: true,
        },
      },
    },
  });
}

export async function getCandidateCertifications() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().certification.findMany({
    where: { visible: true },
    orderBy: [
      { featured: "desc" },
      { sortOrder: "asc" },
      { issueDate: "desc" },
    ],
    select: {
      name: true,
      issuer: true,
    },
  });
}

export async function getCandidateEducation() {
  if (!isDatabaseConfigured()) return [];

  return getDatabase().education.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
    select: {
      institution: true,
      degree: true,
      field: true,
    },
  });
}
