"use client";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { saveEmailSignatureAction } from "@/server/actions/admin-job-applications";
import type { ActionState } from "@/types/action-state";

export function EmailSignatureEditor({
  emailSignature,
}: {
  emailSignature?: unknown;
}) {
  async function handleSave(
    _state: ActionState,
    formData: FormData,
  ): Promise<ActionState> {
    return saveEmailSignatureAction(_state, formData);
  }

  return (
    <AdminMutationForm
      action={handleSave}
      className="space-y-4"
      submitLabel="Save email signature"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Email Signature
        </label>
        <p className="mb-2 text-xs text-[var(--muted)]">
          This signature will be used in all outgoing job application emails.
          You can modify it anytime.
        </p>
        <RichTextEditor
          initialContent={emailSignature}
          label="Email signature"
          name="emailSignature"
        />
      </div>
    </AdminMutationForm>
  );
}
