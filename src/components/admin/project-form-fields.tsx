import type { Project } from "@/generated/prisma/client";

import {
  AdminCheckbox,
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { projectStatuses } from "@/lib/validation/admin-project";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export function ProjectFormFields({ project }: { project?: Project }) {
  return (
    <>
      <input name="id" type="hidden" value={project?.id ?? ""} />
      <AdminField
        defaultValue={project?.title}
        label="Title"
        maxLength={200}
        minLength={2}
        name="title"
        required
      />
      <AdminField
        defaultValue={project?.slug}
        label="Slug"
        maxLength={120}
        minLength={2}
        name="slug"
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        required
      />
      <div className="md:col-span-2">
        <AdminTextarea
          defaultValue={project?.shortDescription}
          label="Short description"
          maxLength={500}
          minLength={20}
          name="shortDescription"
          required
        />
      </div>
      <ProjectRichTextField
        initialContent={project?.richDescription}
        label="Full project description"
        name="richDescription"
      />
      <ProjectRichTextField
        initialContent={project?.problemStatement}
        label="Problem statement"
        name="problemStatement"
      />
      <ProjectRichTextField
        initialContent={project?.solution}
        label="Solution"
        name="solution"
      />
      <ProjectRichTextField
        initialContent={project?.architecture}
        label="Architecture"
        name="architecture"
      />
      <ProjectRichTextField
        initialContent={project?.challenges}
        label="Challenges"
        name="challenges"
      />
      <ProjectRichTextField
        initialContent={project?.outcomes}
        label="Outcomes"
        name="outcomes"
      />
      <AdminField
        defaultValue={project?.projectType ?? undefined}
        label="Project type / tag"
        maxLength={120}
        name="projectType"
      />
      <AdminField
        defaultValue={project?.clientName ?? undefined}
        label="Client / sector"
        maxLength={200}
        name="clientName"
      />
      <AdminField
        defaultValue={project?.companyName ?? undefined}
        label="Company"
        maxLength={200}
        name="companyName"
      />
      <AdminField
        defaultValue={project?.role ?? undefined}
        label="Role"
        maxLength={160}
        name="role"
      />
      <label className="space-y-2 text-sm">
        <span className="font-medium">Status</span>
        <select
          className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
          defaultValue={project?.status ?? "DRAFT"}
          name="status"
          required
        >
          {projectStatuses.map((status) => (
            <option key={status} value={status}>
              {status
                .toLowerCase()
                .replace("_", " ")
                .replace(/^./, (character) => character.toUpperCase())}
            </option>
          ))}
        </select>
      </label>
      <AdminField
        defaultValue={project?.sortOrder ?? 0}
        label="Sort order"
        max={10_000}
        min={0}
        name="sortOrder"
        required
        type="number"
      />
      <AdminField
        defaultValue={dateInput(project?.startDate)}
        label="Start date"
        name="startDate"
        type="date"
      />
      <AdminField
        defaultValue={dateInput(project?.endDate)}
        label="End date"
        name="endDate"
        type="date"
      />
      <AdminField
        defaultValue={project?.githubUrl ?? undefined}
        label="GitHub URL"
        name="githubUrl"
        type="url"
      />
      <AdminField
        defaultValue={project?.liveUrl ?? undefined}
        label="Live URL"
        name="liveUrl"
        type="url"
      />
      <div className="md:col-span-2">
        <AdminTextarea
          defaultValue={project?.technologies.join("\n")}
          label="Technologies · one per line"
          name="technologies"
        />
      </div>
      <div className="flex flex-wrap gap-5 md:col-span-2">
        <AdminCheckbox
          defaultChecked={project?.featured}
          label="Featured (shown first)"
          name="featured"
        />
        <AdminCheckbox
          defaultChecked={project?.visible ?? true}
          label="Visible"
          name="visible"
        />
      </div>
    </>
  );
}

function ProjectRichTextField({
  initialContent,
  label,
  name,
}: {
  initialContent?: unknown;
  label: string;
  name: string;
}) {
  return (
    <div className="md:col-span-2">
      <p className="mb-2 text-sm font-medium">{label}</p>
      <RichTextEditor
        initialContent={initialContent}
        label={label}
        name={name}
      />
    </div>
  );
}

function dateInput(date?: Date | null) {
  return date?.toISOString().slice(0, 10);
}
