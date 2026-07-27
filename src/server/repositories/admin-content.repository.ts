import "server-only";

import { getDatabase } from "@/lib/db/client";

function database() {
  return getDatabase();
}

export async function getAdminProfile() {
  return database().profile.findFirst();
}

export async function getAdminExperiences() {
  return database().experience.findMany({
    orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
  });
}

export async function getAdminProjects() {
  return database().project.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getAdminSkills() {
  return database().skillCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      skills: {
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });
}

export async function getAdminCertifications() {
  return database().certification.findMany({
    orderBy: [{ sortOrder: "asc" }, { issueDate: "desc" }],
  });
}

export async function getAdminEducation() {
  return database().education.findMany({
    orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
  });
}

export async function getAdminSocialLinks() {
  return database().socialLink.findMany({
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
}

export async function getAdminUseItems() {
  return database().useItem.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
}

export async function getAdminThemes() {
  return database().themeDefinition.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAdminMessages() {
  return database().contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminSettings() {
  return database().siteSettings.findFirst();
}

export async function getAdminBlogPosts() {
  return database().blogPost.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getAdminMedia() {
  return database().mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });
}
