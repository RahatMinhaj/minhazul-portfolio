"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { failure, idSchema, success } from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";
import {
  jobApplicationCreateSchema,
  jobApplicationUpdateSchema,
  artifactSchema,
} from "@/lib/validation/job-application";
import {
  createFromCircular,
  saveJobApplication,
  generateArtifacts,
  regenerateArtifact,
  updateArtifact,
  sendJobApplication,
  deleteJobApplication,
} from "@/features/job-applications/job-application.service";
import type { ArtifactKind } from "@/features/job-applications/job-application.generator";

export async function createFromCircularAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const circularContent = String(formData.get("circularContent") ?? "").trim();
  if (circularContent.length < 20) {
    return failure("Please paste the full job circular (at least 20 characters).");
  }

  const result = await createFromCircular(circularContent);
  if (!result.ok) return failure(result.message);

  revalidatePath("/admin/job-applications");
  if (result.id) {
    return success(result.message, { id: result.id });
  }
  return success(result.message);
}

export async function createJobApplicationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = jobApplicationCreateSchema.safeParse({
    companyName: formData.get("companyName"),
    roleTitle: formData.get("roleTitle"),
    recipientEmail: formData.get("recipientEmail"),
    contactName: formData.get("contactName"),
    sourceUrl: formData.get("sourceUrl"),
    circularContent: formData.get("circularContent"),
    jobDescription: formData.get("jobDescription"),
    tone: formData.get("tone"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return failure("Job application validation failed.");

  const result = await saveJobApplication(null, parsed.data);
  if (!result.ok) return failure(result.message);

  revalidatePath("/admin/job-applications");
  return success(result.message);
}

export async function saveJobApplicationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid application ID.");

  const parsed = jobApplicationUpdateSchema.safeParse({
    companyName: formData.get("companyName"),
    roleTitle: formData.get("roleTitle"),
    recipientEmail: formData.get("recipientEmail"),
    contactName: formData.get("contactName"),
    sourceUrl: formData.get("sourceUrl"),
    circularContent: formData.get("circularContent"),
    jobDescription: formData.get("jobDescription"),
    tone: formData.get("tone"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return failure("Job application validation failed.");

  const result = await saveJobApplication(id.data, parsed.data);
  if (!result.ok) return failure(result.message);

  revalidatePath("/admin/job-applications");
  revalidatePath(`/admin/job-applications/${id.data}`);
  return success(result.message);
}

export async function generateJobApplicationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid application ID.");

  const result = await generateArtifacts(id.data);
  if (!result.ok) return failure(result.message);

  revalidatePath(`/admin/job-applications/${id.data}`);
  return success(result.message);
}

export async function regenerateArtifactAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid application ID.");

  const kind = String(formData.get("kind") ?? "").trim() as ArtifactKind;
  const validKinds = ["subject", "summary", "coverLetter", "emailMessage", "linkedinMessage", "keyMatches", "gaps", "interviewPoints"];
  if (!validKinds.includes(kind)) return failure("Invalid artifact kind.");

  const result = await regenerateArtifact(id.data, kind);
  if (!result.ok) return failure(result.message);

  revalidatePath(`/admin/job-applications/${id.data}`);
  return success(result.message, { content: result.content, kind: result.kind });
}

export async function saveArtifactAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const applicationId = idSchema.safeParse(formData.get("applicationId"));
  const artifactId = idSchema.safeParse(formData.get("artifactId"));
  if (!applicationId.success || !artifactId.success) return failure("Invalid IDs.");

  const parsed = artifactSchema.safeParse({
    kind: formData.get("kind"),
    customKind: formData.get("customKind"),
    title: formData.get("title"),
    content: formData.get("content"),
    format: formData.get("format"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) return failure("Artifact validation failed.");

  const result = await updateArtifact(applicationId.data, artifactId.data, {
    content: parsed.data.content,
    title: parsed.data.title || undefined,
    kind: parsed.data.kind || undefined,
  });
  if (!result.ok) return failure(result.message);

  revalidatePath(`/admin/job-applications/${applicationId.data}`);
  return success(result.message);
}

export async function sendJobApplicationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid application ID.");

  const result = await sendJobApplication(id.data);
  if (!result.ok) return failure(result.message);

  revalidatePath(`/admin/job-applications/${id.data}`);
  revalidatePath("/admin/job-applications");
  return success(result.message);
}

export async function deleteJobApplicationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid application ID.");

  const result = await deleteJobApplication(id.data);
  if (!result.ok) return failure(result.message);

  revalidatePath("/admin/job-applications");
  return success(result.message);
}

export async function saveEmailSignatureAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const signature = formData.get("emailSignature");
  if (typeof signature !== "string") return failure("Invalid signature data.");

  let parsed: unknown;
  try {
    parsed = JSON.parse(signature);
  } catch {
    return failure("Invalid signature format.");
  }

  const { saveEmailSignature } = await import(
    "@/features/settings/settings.service"
  );
  const result = await saveEmailSignature(parsed);
  if (!result.ok) return failure(result.message);

  revalidatePath("/admin/settings");
  revalidatePath("/admin/job-applications");
  return success(result.message);
}

export async function uploadCustomCvAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const applicationId = idSchema.safeParse(formData.get("applicationId"));
  if (!applicationId.success) return failure("Invalid application ID.");

  const file = formData.get("customCv") as File | null;
  if (!file || file.size === 0) return failure("Please select a PDF file.");

  if (file.type !== "application/pdf") {
    return failure("Only PDF files are allowed.");
  }

  if (file.size > 10 * 1024 * 1024) {
    return failure("File must be under 10 MB.");
  }

  const { writeFile, mkdir } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { randomUUID } = await import("node:crypto");

  const cvDir = join(process.cwd(), "uploads", "cv", "custom");
  await mkdir(cvDir, { recursive: true });

  const fileName = `${randomUUID()}.pdf`;
  const filePath = join(cvDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const { updateJobApplication } = await import(
    "@/features/job-applications/job-application.repository"
  );
  await updateJobApplication(applicationId.data, {
    customCvPath: filePath,
    customCvName: file.name,
  });

  revalidatePath(`/admin/job-applications/${applicationId.data}`);
  return success("Custom CV uploaded.");
}

export async function sendComposedEmailAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid application ID.");

  const to = String(formData.get("to") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const htmlBody = String(formData.get("htmlBody") ?? "").trim() || undefined;

  if (!to) return failure("Recipient email is required.");
  if (!subject) return failure("Subject is required.");
  if (!body) return failure("Email body is required.");

  const { sendComposedEmail } = await import(
    "@/features/job-applications/job-application.service"
  );
  const result = await sendComposedEmail(id.data, {
    to,
    subject,
    body,
    htmlBody,
  });
  if (!result.ok) return failure(result.message);

  revalidatePath(`/admin/job-applications/${id.data}`);
  revalidatePath("/admin/job-applications");
  return success(result.message);
}

export async function generateFinalEmailBodyAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const bodyHtml = String(
    formData.get("bodyHtml") ?? formData.get("body") ?? "",
  ).trim();
  const coverLetter = String(formData.get("coverLetter") ?? "").trim();
  const signatureHtml = String(formData.get("signatureHtml") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const roleTitle = String(formData.get("roleTitle") ?? "").trim();

  if (!bodyHtml) return failure("Email body is required.");

  const { jobAiIsConfigured, generateFinalEmailHtml } = await import(
    "@/features/job-applications/job-application.generator"
  );
  if (!jobAiIsConfigured()) {
    return failure(
      "No AI provider configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY.",
    );
  }

  try {
    const result = await generateFinalEmailHtml({
      bodyHtml,
      coverLetter,
      signatureHtml,
      companyName,
      roleTitle,
    });
    const { sanitizeEmailHtml } = await import("@/lib/content/sanitize-html");
    const html = sanitizeEmailHtml(result.html);
    if (!html) return failure("AI returned empty content.");
    return success("Final email body generated.", { html });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(`AI generation failed: ${message}`);
  }
}
