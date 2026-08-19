import "server-only";

import { createHash } from "node:crypto";

import * as repository from "./job-application.repository";
import {
  buildCandidateContext,
} from "./candidate-context";
import {
  extractMetadataFromCircular,
  generateAllArtifacts,
  regenerateSingleArtifact,
  PROMPT_VERSION,
  type ArtifactKind,
  type GeneratedArtifacts,
} from "./job-application.generator";
import { readCv } from "@/features/cv/cv-storage";
import { sendEmail } from "@/features/email/email.provider";
import { richTextToPlainText, parseRichTextDocument } from "@/lib/content/rich-text";

export type JobApplicationResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function circularToPlainText(circularContent: string): string {
  const doc = parseRichTextDocument(circularContent);
  if (doc) return richTextToPlainText(doc);
  return circularContent;
}

export async function createFromCircular(
  circularContent: string,
): Promise<JobApplicationResult & { id?: string }> {
  const plainText = circularToPlainText(circularContent);
  const result = await extractMetadataFromCircular(plainText);

  const id = crypto.randomUUID();
  const createData: {
    id: string;
    companyName: string;
    roleTitle: string;
    jobDescription: string;
    circularContent: string;
    recipientEmail?: string;
    contactName?: string;
    sourceUrl?: string;
  } = {
    id,
    companyName: result.metadata.companyName || "Unknown Company",
    roleTitle: result.metadata.roleTitle || "Unknown Role",
    jobDescription: plainText,
    circularContent,
  };

  if (result.metadata.recipientEmail) createData.recipientEmail = result.metadata.recipientEmail;
  if (result.metadata.contactName) createData.contactName = result.metadata.contactName;
  if (result.metadata.sourceUrl) createData.sourceUrl = result.metadata.sourceUrl;

  await repository.createJobApplication(createData);

  const genResult = await generateArtifacts(id);
  if (!genResult.ok) {
    return { ok: true, message: "Application created (artifact generation failed: " + genResult.message + ").", id };
  }

  return { ok: true, message: "Application created with artifacts.", id };
}

export async function saveJobApplication(
  id: string | null,
  data: {
    companyName: string;
    roleTitle: string;
    recipientEmail?: string | null;
    contactName?: string | null;
    sourceUrl?: string | null;
    circularContent: string;
    jobDescription: string;
    tone?: string;
    notes?: string;
  },
): Promise<JobApplicationResult> {
  if (id) {
    const updateData: Record<string, unknown> = { ...data };
    if (updateData.recipientEmail === null) updateData.recipientEmail = null;
    if (updateData.contactName === null) updateData.contactName = null;
    if (updateData.sourceUrl === null) updateData.sourceUrl = null;
    await repository.updateJobApplication(id, updateData);
    return { ok: true, message: "Job application updated." };
  }
  await repository.createJobApplication(data);
  return { ok: true, message: "Job application created." };
}

export async function generateArtifacts(
  applicationId: string,
): Promise<JobApplicationResult> {
  const application = await repository.getAdminJobApplicationById(applicationId);
  if (!application) return { ok: false, message: "Application not found." };

  const circularRaw = application.circularContent || application.jobDescription;
  const circularContent = circularToPlainText(circularRaw);
  const candidate = await buildCandidateContext();
  const result = await generateAllArtifacts({
    candidate,
    circularContent,
    tone: application.tone ?? undefined,
  });

  const artifacts = artifactsToList(result.artifacts);
  await repository.upsertArtifacts(applicationId, artifacts);

  await repository.createGeneration({
    applicationId,
    provider: result.provider,
    model: result.model,
    promptVersion: PROMPT_VERSION,
    inputSnapshot: {
      company: application.companyName,
      role: application.roleTitle,
      circularLength: circularContent.length,
    },
    outputSnapshot: result.artifacts,
    status: "completed",
  });

  await repository.updateJobApplication(applicationId, {
    status: "GENERATED",
    lastGeneratedAt: new Date(),
  });

  return { ok: true, message: "Artifacts generated." };
}

export async function regenerateArtifact(
  applicationId: string,
  kind: ArtifactKind,
): Promise<JobApplicationResult> {
  const application = await repository.getAdminJobApplicationById(applicationId);
  if (!application) return { ok: false, message: "Application not found." };

  const circularRaw = application.circularContent || application.jobDescription;
  const circularContent = circularToPlainText(circularRaw);
  const candidate = await buildCandidateContext();

  const existingArtifacts: Partial<GeneratedArtifacts> = {};
  for (const a of application.artifacts) {
    if (a.kind in ["subject", "summary", "coverLetter", "emailMessage", "linkedinMessage"]) {
      (existingArtifacts as Record<string, string>)[a.kind] = a.content;
    }
    if (a.kind === "keyMatches") existingArtifacts.keyMatches = a.content.split("\n").filter(Boolean);
    if (a.kind === "gaps") existingArtifacts.gaps = a.content.split("\n").filter(Boolean);
    if (a.kind === "interviewPoints") existingArtifacts.interviewPoints = a.content.split("\n").filter(Boolean);
  }

  const result = await regenerateSingleArtifact({
    candidate,
    circularContent,
    kind,
    tone: application.tone ?? undefined,
    existingArtifacts,
  });

  const sortOrderMap: Record<string, number> = {
    subject: 0,
    summary: 1,
    coverLetter: 2,
    emailMessage: 3,
    linkedinMessage: 4,
    keyMatches: 5,
    gaps: 6,
    interviewPoints: 7,
  };

  await repository.upsertArtifacts(applicationId, [
    {
      kind,
      content: result.content,
      sortOrder: sortOrderMap[kind] ?? 99,
      generated: true,
    },
  ]);

  await repository.createGeneration({
    applicationId,
    provider: result.provider,
    model: result.model,
    promptVersion: PROMPT_VERSION,
    inputSnapshot: {
      kind,
      circularLength: circularContent.length,
    },
    outputSnapshot: { kind, content: result.content },
    status: "completed",
  });

  return { ok: true, message: `Regenerated ${kind}.` };
}

export async function updateArtifact(
  applicationId: string,
  artifactId: string,
  data: { content: string; title: string | undefined; kind: string | undefined },
): Promise<JobApplicationResult> {
  const application = await repository.getAdminJobApplicationById(applicationId);
  if (!application) return { ok: false, message: "Application not found." };

  const existing = application.artifacts.find((a: { id: string }) => a.id === artifactId);
  if (!existing) return { ok: false, message: "Artifact not found." };

  await repository.upsertArtifacts(
    applicationId,
    application.artifacts.map((a) =>
      a.id === artifactId
        ? {
            kind: data.kind ?? a.kind,
            title: data.title ?? a.title,
            content: data.content,
            format: a.format,
            sortOrder: a.sortOrder,
            generated: a.generated,
          }
        : {
            kind: a.kind,
            customKind: a.customKind,
            title: a.title,
            content: a.content,
            format: a.format,
            sortOrder: a.sortOrder,
            generated: a.generated,
          },
    ),
  );

  return { ok: true, message: "Artifact updated." };
}

export async function sendJobApplication(
  applicationId: string,
): Promise<JobApplicationResult> {
  const application = await repository.getAdminJobApplicationById(applicationId);
  if (!application) return { ok: false, message: "Application not found." };
  if (!application.recipientEmail) {
    return { ok: false, message: "Recipient email is required to send." };
  }

  const subjectArtifact = application.artifacts.find((a: { kind: string; content: string }) => a.kind === "subject");
  const emailArtifact = application.artifacts.find((a: { kind: string; content: string }) => a.kind === "emailMessage");
  if (!subjectArtifact || !emailArtifact) {
    return { ok: false, message: "Subject and email message artifacts are required." };
  }

  const idempotencyKey = `job-${applicationId}-${Date.now()}`;
  const deliveryData: {
    applicationId: string;
    idempotencyKey: string;
    provider: string;
    fromAddress: string;
    toAddress: string;
    replyTo: string;
    subjectSnapshot: string;
    textSnapshot: string;
    attachmentName: string;
  } = {
    applicationId,
    idempotencyKey,
    provider: "smtp",
    fromAddress: application.recipientEmail,
    toAddress: application.recipientEmail,
    replyTo: application.recipientEmail,
    subjectSnapshot: subjectArtifact.content,
    textSnapshot: emailArtifact.content,
    attachmentName: application.customCvName ?? "resume.pdf",
  };

  const delivery = await repository.createDelivery(deliveryData);

  await repository.updateJobApplication(applicationId, { status: "SENDING" });
  await repository.updateDelivery(delivery.id, { status: "SENDING" });

  try {
    let cvBuffer: Buffer | null = null;
    let cvHash: string | null = null;

    if (application.customCvPath) {
      const { readFile } = await import("node:fs/promises");
      try {
        cvBuffer = await readFile(application.customCvPath);
        cvHash = createHash("sha256").update(cvBuffer).digest("hex");
      } catch {
        cvBuffer = null;
      }
    }

    if (!cvBuffer) {
      cvBuffer = await readCv();
      if (cvBuffer) {
        cvHash = createHash("sha256").update(cvBuffer).digest("hex");
      }
    }

    const emailInput: {
      from: { name: string; address: string };
      to: string;
      subject: string;
      text: string;
      attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
    } = {
      from: { name: "Minhazul Islam", address: process.env.SMTP_FROM_EMAIL ?? application.recipientEmail },
      to: application.recipientEmail,
      subject: subjectArtifact.content,
      text: emailArtifact.content,
    };

    if (cvBuffer) {
      emailInput.attachments = [
        {
          filename: application.customCvName ?? "minhazul-islam-resume.pdf",
          content: cvBuffer,
          contentType: "application/pdf",
        },
      ];
    }

    const result = await sendEmail(emailInput);

    await repository.updateDelivery(delivery.id, {
      status: "SENT",
      providerMessageId: result.providerMessageId,
      attachmentHash: cvHash,
      sentAt: new Date(),
    });

    await repository.updateJobApplication(applicationId, {
      status: "SENT",
      sentAt: new Date(),
    });

    return { ok: true, message: "Application sent successfully." };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    await repository.updateDelivery(delivery.id, {
      status: "FAILED",
      lastError: errorMessage,
    });
    await repository.updateJobApplication(applicationId, { status: "FAILED" });
    return { ok: false, message: `Send failed: ${errorMessage}` };
  }
}

export async function sendComposedEmail(
  applicationId: string,
  data: {
    to: string;
    subject: string;
    body: string;
    useCustomCv: boolean;
  },
): Promise<JobApplicationResult> {
  const application = await repository.getAdminJobApplicationById(applicationId);
  if (!application) return { ok: false, message: "Application not found." };

  const idempotencyKey = `composed-${applicationId}-${Date.now()}`;
  const deliveryData: {
    applicationId: string;
    idempotencyKey: string;
    provider: string;
    fromAddress: string;
    toAddress: string;
    replyTo: string;
    subjectSnapshot: string;
    textSnapshot: string;
    attachmentName: string;
  } = {
    applicationId,
    idempotencyKey,
    provider: "smtp",
    fromAddress: data.to,
    toAddress: data.to,
    replyTo: data.to,
    subjectSnapshot: data.subject,
    textSnapshot: data.body,
    attachmentName: application.customCvName ?? "resume.pdf",
  };

  const delivery = await repository.createDelivery(deliveryData);

  await repository.updateJobApplication(applicationId, { status: "SENDING" });
  await repository.updateDelivery(delivery.id, { status: "SENDING" });

  try {
    let cvBuffer: Buffer | null = null;
    let cvHash: string | null = null;

    if (data.useCustomCv && application.customCvPath) {
      const { readFile } = await import("node:fs/promises");
      try {
        cvBuffer = await readFile(application.customCvPath);
        cvHash = createHash("sha256").update(cvBuffer).digest("hex");
      } catch {
        cvBuffer = null;
      }
    }

    if (!cvBuffer) {
      cvBuffer = await readCv();
      if (cvBuffer) {
        cvHash = createHash("sha256").update(cvBuffer).digest("hex");
      }
    }

    const emailInput: {
      from: { name: string; address: string };
      to: string;
      subject: string;
      text: string;
      attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
    } = {
      from: { name: "Minhazul Islam", address: process.env.SMTP_FROM_EMAIL ?? data.to },
      to: data.to,
      subject: data.subject,
      text: data.body,
    };

    if (cvBuffer) {
      emailInput.attachments = [
        {
          filename: application.customCvName ?? "minhazul-islam-resume.pdf",
          content: cvBuffer,
          contentType: "application/pdf",
        },
      ];
    }

    const result = await sendEmail(emailInput);

    await repository.updateDelivery(delivery.id, {
      status: "SENT",
      providerMessageId: result.providerMessageId,
      attachmentHash: cvHash,
      sentAt: new Date(),
    });

    await repository.updateJobApplication(applicationId, {
      status: "SENT",
      sentAt: new Date(),
    });

    return { ok: true, message: "Email sent successfully." };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    await repository.updateDelivery(delivery.id, {
      status: "FAILED",
      lastError: errorMessage,
    });
    await repository.updateJobApplication(applicationId, { status: "FAILED" });
    return { ok: false, message: `Send failed: ${errorMessage}` };
  }
}

export async function deleteJobApplicationAction(
  id: string,
): Promise<JobApplicationResult> {
  await repository.deleteJobApplication(id);
  return { ok: true, message: "Application deleted." };
}

function artifactsToList(a: GeneratedArtifacts) {
  return [
    { kind: "subject", content: a.subject, sortOrder: 0 },
    { kind: "summary", content: a.summary, sortOrder: 1 },
    { kind: "coverLetter", content: a.coverLetter, sortOrder: 2 },
    { kind: "emailMessage", content: a.emailMessage, sortOrder: 3 },
    { kind: "linkedinMessage", content: a.linkedinMessage, sortOrder: 4 },
    { kind: "keyMatches", content: a.keyMatches.join("\n"), sortOrder: 5 },
    { kind: "gaps", content: a.gaps.join("\n"), sortOrder: 6 },
    { kind: "interviewPoints", content: a.interviewPoints.join("\n"), sortOrder: 7 },
  ];
}
