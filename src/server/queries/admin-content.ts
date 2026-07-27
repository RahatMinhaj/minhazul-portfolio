import "server-only";

import { requireAdmin } from "@/lib/auth/session";
import * as repository from "@/server/repositories/admin-content.repository";

async function authorized<T>(query: () => Promise<T>) {
  await requireAdmin();
  return query();
}

export function getAdminProfile() {
  return authorized(repository.getAdminProfile);
}

export function getAdminExperiences() {
  return authorized(repository.getAdminExperiences);
}

export function getAdminProjects() {
  return authorized(repository.getAdminProjects);
}

export function getAdminSkills() {
  return authorized(repository.getAdminSkills);
}

export function getAdminCertifications() {
  return authorized(repository.getAdminCertifications);
}

export function getAdminEducation() {
  return authorized(repository.getAdminEducation);
}

export function getAdminSocialLinks() {
  return authorized(repository.getAdminSocialLinks);
}

export function getAdminUseItems() {
  return authorized(repository.getAdminUseItems);
}

export function getAdminThemes() {
  return authorized(repository.getAdminThemes);
}

export function getAdminMessages() {
  return authorized(repository.getAdminMessages);
}

export function getAdminSettings() {
  return authorized(repository.getAdminSettings);
}

export function getAdminBlogPosts() {
  return authorized(repository.getAdminBlogPosts);
}

export function getAdminMedia() {
  return authorized(repository.getAdminMedia);
}
