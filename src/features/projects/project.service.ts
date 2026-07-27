import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { projectRepository } from "@/features/projects/project.repository";

export function saveProject(
  id: string,
  data: Prisma.ProjectUncheckedCreateInput,
) {
  return projectRepository.save(id, data);
}

export function deleteProject(id: string) {
  return projectRepository.delete(id);
}
