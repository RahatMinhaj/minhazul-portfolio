import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import { getDatabase } from "@/lib/db/client";

export async function getAdminJobApplications({
  search,
  status,
  page,
  pageSize,
}: {
  search: string | undefined;
  status: string | undefined;
  page: number;
  pageSize: number;
}) {
  const db = getDatabase();
  const where: Record<string, unknown> = {};
  if (status && status !== "all") {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: "insensitive" } },
      { roleTitle: { contains: search, mode: "insensitive" } },
      { recipientEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  const [applications, total] = await Promise.all([
    db.jobApplication.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { artifacts: true, deliveries: true },
    }),
    db.jobApplication.count({ where }),
  ]);

  return { applications, total, page, pageSize };
}

export async function getAdminJobApplicationById(id: string) {
  const db = getDatabase();
  return db.jobApplication.findUnique({
    where: { id },
    include: {
      artifacts: { orderBy: { sortOrder: "asc" } },
      generations: { orderBy: { createdAt: "desc" } },
      deliveries: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createJobApplication(data: {
  id?: string;
  companyName: string;
  roleTitle: string;
  jobDescription: string;
  circularContent?: string;
  recipientEmail?: string | null;
  contactName?: string | null;
  sourceUrl?: string | null;
  customCvName?: string;
  customCvPath?: string;
}) {
  const db = getDatabase();
  return db.jobApplication.create({ data });
}

export async function updateJobApplication(
  id: string,
  data: Record<string, unknown>,
) {
  const db = getDatabase();
  return db.jobApplication.update({ where: { id }, data });
}

export async function deleteJobApplication(id: string) {
  const db = getDatabase();
  return db.jobApplication.delete({ where: { id } });
}

export type ArtifactWrite = {
  kind: string;
  customKind?: string | null;
  title?: string | null;
  content: string;
  format?: string;
  sortOrder?: number;
  generated?: boolean;
};

export async function upsertArtifacts(
  applicationId: string,
  artifacts: ArtifactWrite[],
) {
  const db = getDatabase();
  await db.$transaction([
    db.jobApplicationArtifact.deleteMany({ where: { applicationId } }),
    ...artifacts.map((a, i) =>
      db.jobApplicationArtifact.create({
        data: {
          applicationId,
          kind: a.kind,
          customKind: a.customKind || null,
          title: a.title || null,
          content: a.content,
          format: a.format ?? "MARKDOWN",
          sortOrder: a.sortOrder ?? i,
          generated: a.generated ?? true,
        },
      }),
    ),
  ]);
}

export async function upsertArtifactByKind(
  applicationId: string,
  artifact: ArtifactWrite,
) {
  const db = getDatabase();
  const existing = await db.jobApplicationArtifact.findFirst({
    where: { applicationId, kind: artifact.kind },
  });

  if (existing) {
    return db.jobApplicationArtifact.update({
      where: { id: existing.id },
      data: {
        content: artifact.content,
        customKind: artifact.customKind ?? existing.customKind,
        title: artifact.title ?? existing.title,
        format: artifact.format ?? existing.format,
        sortOrder: artifact.sortOrder ?? existing.sortOrder,
        generated: artifact.generated ?? true,
      },
    });
  }

  return db.jobApplicationArtifact.create({
    data: {
      applicationId,
      kind: artifact.kind,
      customKind: artifact.customKind || null,
      title: artifact.title || null,
      content: artifact.content,
      format: artifact.format ?? "MARKDOWN",
      sortOrder: artifact.sortOrder ?? 0,
      generated: artifact.generated ?? true,
    },
  });
}

export async function updateArtifactById(
  artifactId: string,
  data: { content: string; title?: string | null; kind?: string },
) {
  const db = getDatabase();
  return db.jobApplicationArtifact.update({
    where: { id: artifactId },
    data: {
      content: data.content,
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.kind !== undefined ? { kind: data.kind } : {}),
    },
  });
}

export async function createGeneration(data: {
  applicationId: string;
  provider: string;
  model: string;
  promptVersion: string;
  inputSnapshot: Prisma.InputJsonValue;
  outputSnapshot?: Prisma.InputJsonValue;
  status: string;
  errorCode?: string;
  errorMessage?: string;
}) {
  const db = getDatabase();
  const genData: {
    applicationId: string;
    provider: string;
    model: string;
    promptVersion: string;
    inputSnapshot: Prisma.InputJsonValue;
    status: string;
    outputSnapshot?: Prisma.InputJsonValue;
    completedAt?: Date;
    errorCode?: string;
    errorMessage?: string;
  } = {
    applicationId: data.applicationId,
    provider: data.provider,
    model: data.model,
    promptVersion: data.promptVersion,
    inputSnapshot: data.inputSnapshot,
    status: data.status,
  };

  if (data.outputSnapshot !== undefined) genData.outputSnapshot = data.outputSnapshot;
  if (data.status === "completed") genData.completedAt = new Date();
  if (data.errorCode !== undefined) genData.errorCode = data.errorCode;
  if (data.errorMessage !== undefined) genData.errorMessage = data.errorMessage;

  return db.jobApplicationGeneration.create({ data: genData });
}

export async function createDelivery(data: {
  applicationId: string;
  idempotencyKey: string;
  provider: string;
  fromAddress: string;
  toAddress: string;
  replyTo?: string;
  subjectSnapshot: string;
  textSnapshot: string;
  htmlSnapshot?: string;
  attachmentName?: string;
  attachmentHash?: string;
}) {
  const db = getDatabase();
  return db.jobApplicationDelivery.create({ data });
}

export async function updateDelivery(
  id: string,
  data: Record<string, unknown>,
) {
  const db = getDatabase();
  return db.jobApplicationDelivery.update({
    where: { id },
    data,
  });
}
