"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { Button } from "@/components/ui/button";
import { regenerateArtifactAction } from "@/server/actions/admin-job-applications";
import { ARTIFACT_KIND_LABELS, type ArtifactKind } from "@/features/job-applications/job-application-types";
import type { ActionState } from "@/types/action-state";
import type { Application, Artifact } from "./job-application-editor-types";

export function ArtifactsTab({ application }: { application: Application }) {
  return (
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
  );
}

function ArtifactEditor({
  applicationId,
  artifact,
}: {
  applicationId: string;
  artifact: Artifact;
}) {
  const router = useRouter();
  const [content, setContent] = useState(artifact.content);
  const [expanded, setExpanded] = useState(
    ["subject", "summary", "coverLetter", "emailMessage", "linkedinMessage"].includes(
      artifact.kind,
    ),
  );
  const [regenerating, setRegenerating] = useState(false);

  const kindLabel =
    ARTIFACT_KIND_LABELS[artifact.kind as ArtifactKind] ?? artifact.kind;

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const formData = new FormData();
      formData.set("id", applicationId);
      formData.set("kind", artifact.kind);
      const result = await regenerateArtifactAction({ status: "idle" }, formData);
      if (result.status === "success" && typeof result.data?.content === "string") {
        setContent(result.data.content);
        toast.success(result.message ?? "Regenerated.");
        router.refresh();
      } else {
        toast.error(result.message ?? "Regenerate failed.");
      }
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
          <AdminMutationForm action={handleSaveArtifact} submitLabel="Save">
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
