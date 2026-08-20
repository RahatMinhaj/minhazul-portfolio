"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jobApplicationUpdateSchema } from "@/lib/validation/job-application";
import {
  generateJobApplicationAction,
  saveJobApplicationAction,
} from "@/server/actions/admin-job-applications";
import type { ActionState } from "@/types/action-state";
import type { Application } from "./job-application-editor-types";

type DetailsFormInput = z.input<typeof jobApplicationUpdateSchema>;
type DetailsFormOutput = z.output<typeof jobApplicationUpdateSchema>;

async function generateAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return generateJobApplicationAction(_state, formData);
}

export function DetailsTab({ application }: { application: Application }) {
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DetailsFormInput, unknown, DetailsFormOutput>({
    resolver: zodResolver(jobApplicationUpdateSchema),
    defaultValues: {
      companyName: application.companyName,
      roleTitle: application.roleTitle,
      recipientEmail: application.recipientEmail ?? "",
      contactName: application.contactName ?? "",
      sourceUrl: application.sourceUrl ?? "",
      circularContent: application.circularContent ?? "",
      jobDescription: application.jobDescription,
      tone: application.tone ?? "",
      notes: application.notes ?? "",
    },
  });

  function onSubmit(values: DetailsFormOutput) {
    const formData = new FormData();
    formData.set("id", application.id);
    formData.set("companyName", values.companyName);
    formData.set("roleTitle", values.roleTitle);
    formData.set("recipientEmail", values.recipientEmail ?? "");
    formData.set("contactName", values.contactName ?? "");
    formData.set("sourceUrl", values.sourceUrl ?? "");
    formData.set("circularContent", values.circularContent ?? "");
    formData.set("jobDescription", values.jobDescription);
    formData.set("tone", values.tone ?? "");
    formData.set("notes", values.notes ?? "");

    setPending(true);
    startTransition(async () => {
      try {
        const result = await saveJobApplicationAction(
          { status: "idle" },
          formData,
        );
        if (result.status === "success") {
          toast.success(result.message ?? "Saved.");
        } else {
          toast.error(result.message ?? "Save failed.");
        }
      } finally {
        setPending(false);
      }
    });
  }

  return (
    <div className="space-y-6">
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input type="hidden" {...register("circularContent")} />

        <label className="space-y-2 text-sm">
          <span className="font-medium">Company name</span>
          <Input required {...register("companyName")} />
          {errors.companyName ? (
            <p className="text-xs text-red-500">{errors.companyName.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Role title</span>
          <Input required {...register("roleTitle")} />
          {errors.roleTitle ? (
            <p className="text-xs text-red-500">{errors.roleTitle.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Recipient email</span>
          <Input type="email" {...register("recipientEmail")} />
          {errors.recipientEmail ? (
            <p className="text-xs text-red-500">
              {errors.recipientEmail.message}
            </p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Contact name</span>
          <Input {...register("contactName")} />
          {errors.contactName ? (
            <p className="text-xs text-red-500">{errors.contactName.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Source URL</span>
          <Input type="url" {...register("sourceUrl")} />
          {errors.sourceUrl ? (
            <p className="text-xs text-red-500">{errors.sourceUrl.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium">Tone</span>
          <Input {...register("tone")} />
          {errors.tone ? (
            <p className="text-xs text-red-500">{errors.tone.message}</p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-medium">Job description</span>
          <textarea
            className="w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-sm outline-none focus:border-[var(--accent)]"
            required
            rows={5}
            {...register("jobDescription")}
          />
          {errors.jobDescription ? (
            <p className="text-xs text-red-500">
              {errors.jobDescription.message}
            </p>
          ) : null}
        </label>

        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-medium">Internal notes</span>
          <textarea
            className="w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-sm outline-none focus:border-[var(--accent)]"
            rows={5}
            {...register("notes")}
          />
          {errors.notes ? (
            <p className="text-xs text-red-500">{errors.notes.message}</p>
          ) : null}
        </label>

        <div className="md:col-span-2">
          <Button disabled={pending} size="sm" type="submit">
            {pending ? (
              <LoaderCircle aria-hidden className="animate-spin" size={15} />
            ) : null}
            {pending ? "Working…" : "Save changes"}
          </Button>
        </div>
      </form>

      {application.customCvName ? (
        <p className="text-xs text-[var(--muted)]">
          Custom CV: {application.customCvName}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <AdminMutationForm
          action={generateAction}
          submitLabel="Regenerate all artifacts"
        >
          <input name="id" type="hidden" value={application.id} />
        </AdminMutationForm>
      </div>
    </div>
  );
}
