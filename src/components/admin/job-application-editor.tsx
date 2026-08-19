"use client";

import { useState } from "react";

import { AdminField, AdminTextarea } from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  saveJobApplicationAction,
  generateJobApplicationAction,
  regenerateArtifactAction,
  sendComposedEmailAction,
  uploadCustomCvAction,
} from "@/server/actions/admin-job-applications";
import { formatDate } from "@/lib/utils/date";
import { ARTIFACT_KIND_LABELS, type ArtifactKind } from "@/features/job-applications/job-application-types";
import { richTextToPlainText } from "@/lib/content/rich-text";
import type { ActionState } from "@/types/action-state";

type Artifact = {
  id: string;
  kind: string;
  customKind: string | null;
  title: string | null;
  content: string;
  format: string;
  sortOrder: number;
  generated: boolean;
};

type Delivery = {
  id: string;
  status: string;
  fromAddress: string;
  toAddress: string;
  subjectSnapshot: string;
  attachmentName: string | null;
  createdAt: Date;
  sentAt: Date | null;
  lastError: string | null;
};

type Application = {
  id: string;
  companyName: string;
  roleTitle: string;
  recipientEmail: string | null;
  contactName: string | null;
  sourceUrl: string | null;
  circularContent: string;
  jobDescription: string;
  status: string;
  tone: string | null;
  notes: string | null;
  customCvName: string | null;
  lastGeneratedAt: Date | null;
  sentAt: Date | null;
  artifacts: Artifact[];
  deliveries: Delivery[];
  createdAt: Date;
};

async function saveApplicationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return saveJobApplicationAction(_state, formData);
}

async function generateAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return generateJobApplicationAction(_state, formData);
}

export function JobApplicationEditor({
  application,
  emailSignature,
  systemCv,
}: {
  application: Application;
  emailSignature?: unknown;
  systemCv?: { sizeBytes: number; updatedAt: Date } | null | undefined;
}) {
  const [activeTab, setActiveTab] = useState<
    "circular" | "details" | "artifacts" | "compose" | "deliveries"
  >(application.artifacts.length > 0 ? "compose" : "circular");

  const subjectArtifact = application.artifacts.find((a) => a.kind === "subject");
  const emailBodyArtifact = application.artifacts.find((a) => a.kind === "emailMessage");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setActiveTab("circular")}
          size="sm"
          variant={activeTab === "circular" ? "default" : "ghost"}
        >
          Job Circular
        </Button>
        <Button
          onClick={() => setActiveTab("details")}
          size="sm"
          variant={activeTab === "details" ? "default" : "ghost"}
        >
          Details
        </Button>
        <Button
          onClick={() => setActiveTab("artifacts")}
          size="sm"
          variant={activeTab === "artifacts" ? "default" : "ghost"}
        >
          Generated Content ({application.artifacts.length})
        </Button>
        <Button
          onClick={() => setActiveTab("compose")}
          size="sm"
          variant={activeTab === "compose" ? "default" : "ghost"}
        >
          Compose Email
        </Button>
        <Button
          onClick={() => setActiveTab("deliveries")}
          size="sm"
          variant={activeTab === "deliveries" ? "default" : "ghost"}
        >
          Delivery History ({application.deliveries.length})
        </Button>
      </div>

      {activeTab === "circular" && (
        <div className="space-y-6">
          <AdminMutationForm
            action={saveApplicationAction}
            className="space-y-4"
            submitLabel="Save circular"
          >
            <input name="id" type="hidden" value={application.id} />
            <input name="companyName" type="hidden" value={application.companyName} />
            <input name="roleTitle" type="hidden" value={application.roleTitle} />
            <input name="recipientEmail" type="hidden" value={application.recipientEmail ?? ""} />
            <input name="contactName" type="hidden" value={application.contactName ?? ""} />
            <input name="sourceUrl" type="hidden" value={application.sourceUrl ?? ""} />
            <input name="tone" type="hidden" value={application.tone ?? ""} />
            <input name="jobDescription" type="hidden" value={application.jobDescription} />
            <input name="notes" type="hidden" value={application.notes ?? ""} />
            <div>
              <label className="mb-2 block text-sm font-medium">
                Job Circular Content
              </label>
              <RichTextEditor
                initialContent={application.circularContent || application.jobDescription}
                label="Job circular content"
                name="circularContent"
              />
            </div>
          </AdminMutationForm>

          <div className="flex flex-wrap gap-3">
            <AdminMutationForm action={generateAction} submitLabel="Generate all artifacts with AI">
              <input name="id" type="hidden" value={application.id} />
            </AdminMutationForm>
          </div>
        </div>
      )}

      {activeTab === "details" && (
        <div className="space-y-6">
          <AdminMutationForm
            action={saveApplicationAction}
            className="grid gap-4 md:grid-cols-2"
            submitLabel="Save changes"
          >
            <input name="id" type="hidden" value={application.id} />
            <AdminField
              defaultValue={application.companyName}
              label="Company name"
              name="companyName"
              required
            />
            <AdminField
              defaultValue={application.roleTitle}
              label="Role title"
              name="roleTitle"
              required
            />
            <AdminField
              defaultValue={application.recipientEmail ?? ""}
              label="Recipient email"
              name="recipientEmail"
              type="email"
            />
            <AdminField
              defaultValue={application.contactName ?? ""}
              label="Contact name"
              name="contactName"
            />
            <AdminField
              defaultValue={application.sourceUrl ?? ""}
              label="Source URL"
              name="sourceUrl"
              type="url"
            />
            <AdminField
              defaultValue={application.tone ?? ""}
              label="Tone"
              name="tone"
            />
            <div className="md:col-span-2">
              <AdminTextarea
                defaultValue={application.jobDescription}
                label="Job description"
                name="jobDescription"
                required
              />
            </div>
            <div className="md:col-span-2">
              <AdminTextarea
                defaultValue={application.notes ?? ""}
                label="Internal notes"
                name="notes"
              />
            </div>
          </AdminMutationForm>

          {application.customCvName ? (
            <p className="text-xs text-[var(--muted)]">
              Custom CV: {application.customCvName}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <AdminMutationForm action={generateAction} submitLabel="Regenerate all artifacts">
              <input name="id" type="hidden" value={application.id} />
            </AdminMutationForm>
          </div>
        </div>
      )}

      {activeTab === "artifacts" && (
        <div className="space-y-6">
          {application.artifacts.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted)]">
                No artifacts generated yet. Go to the Job Circular tab and click
                &quot;Generate all artifacts with AI&quot;.
              </p>
            </div>
          ) : (
            application.artifacts.map((artifact) => (
              <ArtifactEditor
                applicationId={application.id}
                artifact={artifact}
                key={artifact.id}
              />
            ))
          )}
        </div>
      )}

      {activeTab === "compose" && (
        <ComposeEmailTab
          application={application}
          emailSignature={emailSignature}
          subjectArtifact={subjectArtifact}
          emailBodyArtifact={emailBodyArtifact}
          systemCv={systemCv}
        />
      )}

      {activeTab === "deliveries" && (
        <div className="space-y-4">
          {application.deliveries.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No deliveries yet.</p>
          ) : (
            application.deliveries.map((delivery) => (
              <div
                className="rounded-[var(--radius-card)] border border-[var(--border)] p-4"
                key={delivery.id}
              >
                <div className="flex items-center gap-3">
                  <span className="rounded bg-[var(--surface-raised)] px-2 py-0.5 text-xs font-medium">
                    {delivery.status}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    To: {delivery.toAddress}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {formatDate(delivery.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  Subject: {delivery.subjectSnapshot}
                </p>
                {delivery.attachmentName ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Attachment: {delivery.attachmentName}
                  </p>
                ) : null}
                {delivery.lastError ? (
                  <p className="mt-2 text-xs text-red-500">
                    Error: {delivery.lastError}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ComposeEmailTab({
  application,
  emailSignature,
  subjectArtifact,
  emailBodyArtifact,
  systemCv,
}: {
  application: Application;
  emailSignature?: unknown | undefined;
  subjectArtifact?: Artifact | undefined;
  emailBodyArtifact?: Artifact | undefined;
  systemCv?: { sizeBytes: number; updatedAt: Date } | null | undefined;
}) {
  const [to, setTo] = useState(application.recipientEmail ?? "");
  const [subject, setSubject] = useState(subjectArtifact?.content ?? "");
  const [body, setBody] = useState(emailBodyArtifact?.content ?? "");
  const [cvSource, setCvSource] = useState<"system" | "custom">(
    application.customCvName ? "custom" : "system",
  );
  const [regeneratingSubject, setRegeneratingSubject] = useState(false);
  const [regeneratingBody, setRegeneratingBody] = useState(false);

  async function handleRegenerateSubject() {
    setRegeneratingSubject(true);
    try {
      const formData = new FormData();
      formData.set("id", application.id);
      formData.set("kind", "subject");
      await regenerateArtifactAction({ status: "idle" }, formData);
      window.location.reload();
    } finally {
      setRegeneratingSubject(false);
    }
  }

  async function handleRegenerateBody() {
    setRegeneratingBody(true);
    try {
      const formData = new FormData();
      formData.set("id", application.id);
      formData.set("kind", "emailMessage");
      await regenerateArtifactAction({ status: "idle" }, formData);
      window.location.reload();
    } finally {
      setRegeneratingBody(false);
    }
  }

  async function handleSendEmail(
    _state: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    formData.set("id", application.id);
    formData.set("to", to);
    formData.set("subject", subject);
    formData.set("body", body);
    if (cvSource === "custom") formData.set("useCustomCv", "on");
    return sendComposedEmailAction(_state, formData);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="mb-4 text-sm font-medium">Compose Email</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="compose-to">
              To
            </label>
            <input
              className="w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              id="compose-to"
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              type="email"
              value={to}
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="compose-subject">
                Subject
              </label>
              <Button
                disabled={regeneratingSubject}
                onClick={handleRegenerateSubject}
                size="sm"
                variant="outline"
              >
                {regeneratingSubject ? "Regenerating..." : "Regenerate"}
              </Button>
            </div>
            <input
              className="w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              id="compose-subject"
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              type="text"
              value={subject}
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="compose-body">
                Email Body
              </label>
              <Button
                disabled={regeneratingBody}
                onClick={handleRegenerateBody}
                size="sm"
                variant="outline"
              >
                {regeneratingBody ? "Regenerating..." : "Regenerate"}
              </Button>
            </div>
            <textarea
              className="w-full min-h-[200px] rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-3 font-mono text-sm leading-6 outline-none focus:border-[var(--accent)]"
              id="compose-body"
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email body content"
              value={body}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">CV Attachment</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-3">
                <input
                  checked={cvSource === "system"}
                  className="rounded-full border-[var(--border)]"
                  name="cvSource"
                  onChange={() => setCvSource("system")}
                  type="radio"
                  value="system"
                />
                <div className="flex-1">
                  <span className="text-sm">System default CV</span>
                  {systemCv ? (
                    <div className="mt-1 flex items-center gap-2 text-xs text-[var(--muted)]">
                      <span>resume.pdf</span>
                      <span>·</span>
                      <span>{(systemCv.sizeBytes / 1024).toFixed(0)} KB</span>
                      <span>·</span>
                      <span>Updated {formatDate(systemCv.updatedAt)}</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      No system CV uploaded yet
                    </p>
                  )}
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-3">
                <input
                  checked={cvSource === "custom"}
                  className="rounded-full border-[var(--border)]"
                  name="cvSource"
                  onChange={() => setCvSource("custom")}
                  type="radio"
                  value="custom"
                />
                <div className="flex-1">
                  <span className="text-sm">Custom CV</span>
                  {application.customCvName ? (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Uploaded: {application.customCvName}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Upload a custom CV for this application
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {cvSource === "custom" && <CustomCvUpload applicationId={application.id} />}

          {emailSignature ? (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Email Signature (from Settings)
              </label>
              <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-raised)] p-3 text-sm text-[var(--muted)]">
                <p className="mb-1 text-xs">Preview (saved in Settings):</p>
                <pre className="whitespace-pre-wrap text-xs">
                  {richTextToPlainText(emailSignature)}
                </pre>
              </div>
            </div>
          ) : null}

          <AdminMutationForm
            action={handleSendEmail}
            submitLabel="Send email"
          >
            <span />
          </AdminMutationForm>
        </div>
      </div>
    </div>
  );
}

function CustomCvUpload({ applicationId }: { applicationId: string }) {
  async function handleUpload(
    _state: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    formData.set("applicationId", applicationId);
    return uploadCustomCvAction(_state, formData);
  }

  return (
    <AdminMutationForm action={handleUpload} submitLabel="Upload custom CV">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="custom-cv">
          Upload custom CV (PDF, max 10 MB)
        </label>
        <input
          accept=".pdf,application/pdf"
          className="w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          id="custom-cv"
          name="customCv"
          type="file"
        />
      </div>
    </AdminMutationForm>
  );
}

function ArtifactEditor({
  applicationId,
  artifact,
}: {
  applicationId: string;
  artifact: Artifact;
}) {
  const [content, setContent] = useState(artifact.content);
  const [expanded, setExpanded] = useState(
    ["subject", "summary", "coverLetter", "emailMessage", "linkedinMessage"].includes(artifact.kind),
  );
  const [regenerating, setRegenerating] = useState(false);

  const kindLabel = ARTIFACT_KIND_LABELS[artifact.kind as ArtifactKind] ?? artifact.kind;

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const formData = new FormData();
      formData.set("id", applicationId);
      formData.set("kind", artifact.kind);
      await regenerateArtifactAction({ status: "idle" }, formData);
      window.location.reload();
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSaveArtifact(
    _state: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    formData.set("applicationId", applicationId);
    formData.set("artifactId", artifact.id);
    formData.set("kind", artifact.kind);
    const { saveArtifactAction: saveAction } = await import(
      "@/server/actions/admin-job-applications"
    );
    return saveAction(_state, formData);
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] p-5">
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <div className="flex items-center gap-3">
          <span className="rounded bg-[var(--surface-raised)] px-2 py-0.5 text-xs font-medium">
            {kindLabel}
          </span>
          {artifact.generated ? (
            <span className="text-xs text-[var(--muted)]">AI generated</span>
          ) : null}
        </div>
        <span className="text-xs text-[var(--muted)]">
          {expanded ? "Collapse" : "Expand"}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          <AdminMutationForm
            action={handleSaveArtifact}
            submitLabel="Save"
          >
            <textarea
              className="w-full min-h-48 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-3 font-mono text-sm leading-6 outline-none focus:border-[var(--accent)]"
              name="content"
              onChange={(e) => setContent(e.target.value)}
              value={content}
            />
          </AdminMutationForm>

          <Button
            disabled={regenerating}
            onClick={handleRegenerate}
            size="sm"
            variant="outline"
          >
            {regenerating ? "Regenerating..." : `Regenerate ${kindLabel}`}
          </Button>
        </div>
      )}
    </div>
  );
}
