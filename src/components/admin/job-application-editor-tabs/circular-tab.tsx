"use client";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  saveJobApplicationAction,
  generateJobApplicationAction,
} from "@/server/actions/admin-job-applications";
import type { ActionState } from "@/types/action-state";
import type { Application } from "./job-application-editor-types";

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

export function CircularTab({ application }: { application: Application }) {
  return (
    <div className="space-y-6">
      <AdminMutationForm
        action={saveApplicationAction}
        className="space-y-4"
        submitLabel="Save circular"
      >
        <input name="id" type="hidden" value={application.id} />
        <input name="companyName" type="hidden" value={application.companyName} />
        <input name="roleTitle" type="hidden" value={application.roleTitle} />
        <input
          name="recipientEmail"
          type="hidden"
          value={application.recipientEmail ?? ""}
        />
        <input
          name="contactName"
          type="hidden"
          value={application.contactName ?? ""}
        />
        <input
          name="sourceUrl"
          type="hidden"
          value={application.sourceUrl ?? ""}
        />
        <input name="tone" type="hidden" value={application.tone ?? ""} />
        <input
          name="jobDescription"
          type="hidden"
          value={application.jobDescription}
        />
        <input name="notes" type="hidden" value={application.notes ?? ""} />
        <div>
          <label className="mb-2 block text-sm font-medium">
            Job Circular Content
          </label>
          <RichTextEditor
            initialContent={
              application.circularContent || application.jobDescription
            }
            label="Job circular content"
            name="circularContent"
          />
        </div>
      </AdminMutationForm>

      <div className="flex flex-wrap gap-3">
        <AdminMutationForm
          action={generateAction}
          submitLabel="Generate all artifacts with AI"
        >
          <input name="id" type="hidden" value={application.id} />
        </AdminMutationForm>
      </div>
    </div>
  );
}
