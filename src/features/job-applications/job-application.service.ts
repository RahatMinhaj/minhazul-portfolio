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
} from "./job-application.generator";
import type { AiProviderPreference } from "./job-application-types";
import {
  ARTIFACT_SORT_ORDER,
  TEXT_ARTIFACT_KINDS,
  type ArtifactKind,
  type GeneratedArtifacts,
} from "./job-application-types";
import { readCv } from "@/features/cv/cv-storage";
import { sendEmail } from "@/features/email/email.provider";
import { richTextToPlainText, parseRichTextDocument } from "@/lib/content/rich-text";

export type JobApplicationResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type RegenerateArtifactResult =
  | { ok: true; message: string; content: string; kind: ArtifactKind }
  | { ok: false; message: string };

function circularToPlainText(circularContent: string): string {
  const doc = parseRichTextDocument(circularContent);
  if (doc) return richTextToPlainText(doc);
  return circularContent;
}

export async function createFromCircular(
  circularContent: string,
  provider: AiProviderPreference = "auto",
): Promise<JobApplicationResult & { id?: string }> {
  const plainText = circularToPlainText(circularContent);
  const result = await extractMetadataFromCircular(plainText, provider);

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

  const genResult = await generateArtifacts(id, provider);
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
  provider: AiProviderPreference = "auto",
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
    provider,
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
  provider: AiProviderPreference = "auto",
): Promise<RegenerateArtifactResult> {
  const application = await repository.getAdminJobApplicationById(applicationId);
  if (!application) return { ok: false, message: "Application not found." };

  const circularRaw = application.circularContent || application.jobDescription;
  const circularContent = circularToPlainText(circularRaw);
  const candidate = await buildCandidateContext();

  const existingArtifacts: Partial<GeneratedArtifacts> = {};
  const textKinds = new Set<string>(TEXT_ARTIFACT_KINDS);
  for (const a of application.artifacts) {
    if (textKinds.has(a.kind)) {
      (existingArtifacts as Record<string, string>)[a.kind] = a.content;
    }
    if (a.kind === "keyMatches")
      existingArtifacts.keyMatches = a.content.split("\n").filter(Boolean);
    if (a.kind === "gaps")
      existingArtifacts.gaps = a.content.split("\n").filter(Boolean);
    if (a.kind === "interviewPoints")
      existingArtifacts.interviewPoints = a.content.split("\n").filter(Boolean);
  }

  const result = await regenerateSingleArtifact({
    candidate,
    circularContent,
    kind,
    tone: application.tone ?? undefined,
    existingArtifacts,
    provider,
  });

  await repository.upsertArtifactByKind(applicationId, {
    kind,
    content: result.content,
    sortOrder: ARTIFACT_SORT_ORDER[kind],
    generated: true,
  });

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

  return { ok: true, message: `Regenerated ${kind}.`, content: result.content, kind };
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

  await repository.updateArtifactById(artifactId, {
    content: data.content,
    title: data.title ?? existing.title,
    kind: data.kind ?? existing.kind,
  });

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

  const cvBuffer = await readCv();
  if (!cvBuffer) {
    return { ok: false, message: "No CV found. Upload a CV in the CV menu before sending." };
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
    let cvHash: string | null = null;
    if (cvBuffer) {
      cvHash = createHash("sha256").update(cvBuffer).digest("hex");
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
    htmlBody?: string | undefined;
  },
): Promise<JobApplicationResult> {
  const application = await repository.getAdminJobApplicationById(applicationId);
  if (!application) return { ok: false, message: "Application not found." };

  const cvBuffer = await readCv();
  if (!cvBuffer) {
    return { ok: false, message: "No CV found. Upload a CV in the CV menu before sending." };
  }

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
    htmlSnapshot?: string;
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
    attachmentName: "minhazul-islam-resume.pdf",
  };
  if (data.htmlBody) deliveryData.htmlSnapshot = data.htmlBody;

  const delivery = await repository.createDelivery(deliveryData);

  await repository.updateJobApplication(applicationId, { status: "SENDING" });
  await repository.updateDelivery(delivery.id, { status: "SENDING" });

  try {
    let cvHash: string | null = null;
    if (cvBuffer) {
      cvHash = createHash("sha256").update(cvBuffer).digest("hex");
    }

    const emailInput: {
      from: { name: string; address: string };
      to: string;
      subject: string;
      text: string;
      html?: string;
      attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
    } = {
      from: { name: "Minhazul Islam", address: process.env.SMTP_FROM_EMAIL ?? data.to },
      to: data.to,
      subject: data.subject,
      text: data.body,
    };

    if (data.htmlBody) {
      emailInput.html = data.htmlBody;
    }

    if (cvBuffer) {
      emailInput.attachments = [
        {
          filename: "minhazul-islam-resume.pdf",
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
      recipientEmail: data.to.trim().toLowerCase(),
    });

    const { rememberSavedRecipientEmail } = await import(
      "@/features/job-applications/saved-email.service"
    );
    await rememberSavedRecipientEmail(data.to, { bumpUseCount: true });

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

export async function deleteJobApplication(
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
