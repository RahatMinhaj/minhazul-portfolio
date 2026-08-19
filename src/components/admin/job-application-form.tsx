"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { createFromCircularAction } from "@/server/actions/admin-job-applications";
import type { ActionState } from "@/types/action-state";
import { initialActionState } from "@/types/action-state";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? (
        <LoaderCircle className="animate-spin" aria-hidden size={15} />
      ) : null}
      {pending ? "Working..." : label}
    </Button>
  );
}

export function NewJobApplicationForm() {
  const router = useRouter();
  const [, formAction, isPending] = useActionState(
    async (_state: ActionState, formData: FormData): Promise<ActionState> => {
      const result = await createFromCircularAction(_state, formData);
      if (result.status === "success" && result.data?.id) {
        router.push(`/admin/job-applications/${result.data.id}`);
      }
      return result;
    },
    initialActionState,
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Paste the full job circular below. AI will analyze it and extract company name,
        role title, contact info, and generate all application materials.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Job Circular
          </label>
          <RichTextEditor
            label="Paste job circular here"
            name="circularContent"
          />
        </div>

        <SubmitButton label="Create from circular" />
      </form>

      {isPending ? (
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--accent)]/20 bg-[var(--surface-raised)] p-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="text-sm text-[var(--muted)]">
            Analyzing circular and creating application...
          </p>
        </div>
      ) : null}
    </div>
  );
}
