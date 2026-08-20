"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  regenerateArtifactAction,
  sendComposedEmailAction,
  generateFinalEmailBodyAction,
} from "@/server/actions/admin-job-applications";
import { getSavedEmails, saveSentEmail } from "@/server/actions/admin-saved-emails";
import { formatDate } from "@/lib/utils/date";
import {
  htmlToPlainText,
  richTextToHtml,
} from "@/lib/content/rich-text";
import { sanitizeEmailHtml } from "@/lib/content/sanitize-html";
import { assembleFinalEmailHtml } from "@/features/job-applications/compose-final-email";
import type { ArtifactKind } from "@/features/job-applications/job-application-types";
import type { ActionState } from "@/types/action-state";
import type { Application, Artifact } from "./job-application-editor-types";

export function ComposeTab({
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
  const router = useRouter();
  const [to, setTo] = useState(application.recipientEmail ?? "");
  const [subject, setSubject] = useState(subjectArtifact?.content ?? "");
  const [emailBodyContent, setEmailBodyContent] = useState(
    emailBodyArtifact?.content ?? "",
  );
  const [draftHtml, setDraftHtml] = useState("");
  const [emailBodyKey, setEmailBodyKey] = useState(0);
  const [includeCoverLetter, setIncludeCoverLetter] = useState(false);
  const [includeSignature, setIncludeSignature] = useState(!!emailSignature);
  const [finalHtml, setFinalHtml] = useState("");
  const [finalEditorHtml, setFinalEditorHtml] = useState("");
  const [finalContentKey, setFinalContentKey] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [regeneratingSubject, setRegeneratingSubject] = useState(false);
  const [regeneratingBody, setRegeneratingBody] = useState(false);
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSavedEmails()
      .then((emails) => {
        if (!cancelled) setSavedEmails(emails);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSuggestions = (() => {
    const q = to.trim().toLowerCase();
    if (!q) return savedEmails;
    return savedEmails.filter((email) => email.toLowerCase().includes(q));
  })();

  async function persistRecipientEmail(email: string, bumpUseCount = false) {
    const trimmed = email.trim();
    if (!trimmed.includes("@")) return;
    const formData = new FormData();
    formData.set("email", trimmed);
    if (bumpUseCount) formData.set("bumpUseCount", "1");
    const result = await saveSentEmail({ status: "idle" }, formData);
    if (result.status === "success" && typeof result.data?.email === "string") {
      const saved = result.data.email;
      setSavedEmails((prev) =>
        prev.includes(saved) ? prev : [saved, ...prev],
      );
    }
  }

  const coverLetterArtifact = application.artifacts.find(
    (a) => a.kind === "coverLetter",
  );
  const signatureHtml = emailSignature ? richTextToHtml(emailSignature) : "";

  function currentDraftHtml() {
    return draftHtml.trim() || richTextToHtml(emailBodyContent);
  }

  function applyFinalHtml(html: string) {
    const sanitized = sanitizeEmailHtml(html);
    setFinalHtml(sanitized);
    setFinalEditorHtml(sanitized);
    setFinalContentKey((key) => key + 1);
  }

  function assembleFromParts(
    nextIncludeCoverLetter = includeCoverLetter,
    nextIncludeSignature = includeSignature,
  ) {
    return assembleFinalEmailHtml({
      bodyHtml: currentDraftHtml(),
      coverLetter: coverLetterArtifact?.content ?? "",
      signatureHtml,
      includeCoverLetter: nextIncludeCoverLetter,
      includeSignature: nextIncludeSignature,
    });
  }

  async function regenerateKind(kind: ArtifactKind) {
    const formData = new FormData();
    formData.set("id", application.id);
    formData.set("kind", kind);
    const result = await regenerateArtifactAction({ status: "idle" }, formData);
    if (result.status === "success" && typeof result.data?.content === "string") {
      toast.success(result.message ?? "Regenerated.");
      router.refresh();
      return result.data.content;
    }
    toast.error(result.message ?? "Regenerate failed.");
    return null;
  }

  async function handleRegenerateSubject() {
    setRegeneratingSubject(true);
    try {
      const content = await regenerateKind("subject");
      if (content) setSubject(content);
    } finally {
      setRegeneratingSubject(false);
    }
  }

  async function handleRegenerateBody() {
    setRegeneratingBody(true);
    try {
      const content = await regenerateKind("emailMessage");
      if (content) {
        setEmailBodyContent(content);
        setEmailBodyKey((key) => key + 1);
      }
    } finally {
      setRegeneratingBody(false);
    }
  }

  async function handleGenerateFinal() {
    setGenerating(true);
    try {
      const assembled = assembleFromParts();
      if (!assembled.trim()) {
        toast.error("Email body is required.");
        return;
      }

      const formData = new FormData();
      formData.set("bodyHtml", assembled);
      formData.set(
        "coverLetter",
        includeCoverLetter ? (coverLetterArtifact?.content ?? "") : "",
      );
      formData.set("signatureHtml", includeSignature ? signatureHtml : "");
      formData.set("companyName", application.companyName);
      formData.set("roleTitle", application.roleTitle);

      const result = await generateFinalEmailBodyAction(
        { status: "idle" },
        formData,
      );
      if (result.status === "success" && typeof result.data?.html === "string") {
        applyFinalHtml(result.data.html);
        toast.success(result.message ?? "Final email body generated.");
      } else {
        toast.error(result.message ?? "Generation failed.");
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleSendEmail(
    _state: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    if (!systemCv) {
      return {
        status: "error",
        message: "No CV found. Upload a CV in the CV menu before sending.",
        version: Date.now(),
      };
    }
    const html = sanitizeEmailHtml(finalEditorHtml || finalHtml);
    if (!html.trim()) {
      return {
        status: "error",
        message: "Generate the final email body first.",
        version: Date.now(),
      };
    }
    const text = htmlToPlainText(html);
    formData.set("id", application.id);
    formData.set("to", to);
    formData.set("subject", subject);
    formData.set("body", text);
    formData.set("htmlBody", html);

    const result = await sendComposedEmailAction(_state, formData);
    if (result.status === "success" && to) {
      await persistRecipientEmail(to, true);
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h3 className="mb-4 text-sm font-medium">Compose Email</h3>

        <div className="space-y-4">
          <div className="relative">
            <label className="mb-1 block text-sm font-medium" htmlFor="compose-to">
              To
            </label>
            <div className="relative">
              <input
                autoComplete="off"
                className="w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 pr-8 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)]"
                id="compose-to"
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 150);
                  void persistRecipientEmail(to);
                }}
                onChange={(e) => {
                  setTo(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Select or type email..."
                type="email"
                value={to}
              />
              <button
                aria-label="Show saved emails"
                className="absolute top-1/2 right-2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                onClick={() => setShowSuggestions((open) => !open)}
                type="button"
              >
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
            {showSuggestions && filteredSuggestions.length > 0 ? (
              <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] shadow-lg">
                <li className="px-3 py-1.5 text-xs font-medium tracking-wide text-[var(--muted)] uppercase">
                  {to.trim() ? "Matching emails" : "Previous recipients"}
                </li>
                {filteredSuggestions.map((email) => (
                  <li key={email}>
                    <button
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-[var(--surface-raised)] ${
                        email === to.trim().toLowerCase()
                          ? "bg-[var(--surface-raised)] font-medium"
                          : ""
                      }`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setTo(email);
                        setShowSuggestions(false);
                        void persistRecipientEmail(email);
                      }}
                      type="button"
                    >
                      {email}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {showSuggestions &&
            filteredSuggestions.length === 0 &&
            to.trim() ? (
              <p className="mt-1 text-xs text-[var(--muted)]">
                New address — it will be saved when you leave this field or send.
              </p>
            ) : null}
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
              <label className="text-sm font-medium">Email Body (Draft)</label>
              <Button
                disabled={regeneratingBody}
                onClick={handleRegenerateBody}
                size="sm"
                variant="outline"
              >
                {regeneratingBody ? "Regenerating..." : "Regenerate"}
              </Button>
            </div>
            <RichTextEditor
              contentKey={emailBodyKey}
              initialContent={emailBodyContent}
              label="Email body draft"
              name="emailBody"
              onHtmlChange={setDraftHtml}
              variant="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Include in Final Email</label>
            <div className="flex flex-wrap gap-4">
              {coverLetterArtifact ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={includeCoverLetter}
                    className="rounded border-[var(--border)]"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIncludeCoverLetter(checked);
                      applyFinalHtml(assembleFromParts(checked, includeSignature));
                    }}
                    type="checkbox"
                  />
                  Cover letter
                </label>
              ) : null}
              {emailSignature ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={includeSignature}
                    className="rounded border-[var(--border)]"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIncludeSignature(checked);
                      applyFinalHtml(assembleFromParts(includeCoverLetter, checked));
                    }}
                    type="checkbox"
                  />
                  Signature
                </label>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              disabled={generating}
              onClick={handleGenerateFinal}
              size="default"
            >
              {generating ? "Generating..." : "Generate Final Email"}
            </Button>
            {finalHtml ? (
              <span className="text-xs text-green-500">Final email ready</span>
            ) : (
              <span className="text-xs text-[var(--muted)]">Not generated yet</span>
            )}
          </div>

          {finalHtml ? (
            <div>
              <label className="mb-1 block text-sm font-medium">
                Final Email (editable)
              </label>
              <RichTextEditor
                contentKey={finalContentKey}
                initialContent={finalHtml}
                label="Final email body"
                name="finalHtmlContent"
                onHtmlChange={setFinalEditorHtml}
                variant="email"
              />
            </div>
          ) : null}

          <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-raised)] p-3">
            <label className="text-sm font-medium">CV Attachment</label>
            {systemCv ? (
              <p className="mt-1 text-xs text-[var(--muted)]">
                resume.pdf · {(systemCv.sizeBytes / 1024).toFixed(0)} KB · Updated{" "}
                {formatDate(systemCv.updatedAt)}
              </p>
            ) : (
              <p className="mt-1 text-xs text-red-500">
                No CV uploaded. Upload a CV in the CV menu before sending.
              </p>
            )}
          </div>

          <AdminMutationForm
            action={handleSendEmail}
            submitLabel={systemCv && finalHtml ? "Send email" : "Cannot send yet"}
          >
            <span />
          </AdminMutationForm>
        </div>
      </div>
    </div>
  );
}
