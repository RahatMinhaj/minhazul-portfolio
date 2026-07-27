import type { Project } from "@/generated/prisma/client";

import {
  AdminCheckbox,
  AdminField,
  AdminTextarea,
} from "@/components/admin/admin-fields";
import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  deleteProjectAction,
  saveProjectAction,
} from "@/server/actions/admin-projects";
import { getAdminProjects } from "@/server/queries/admin-content";

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Manage project publication state, visibility, featured placement, technology tags, and links."
        title="Projects"
      />
      <Card>
        <CardHeader>
          <CardTitle>Add project</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm />
        </CardContent>
      </Card>
      <div className="mt-8 space-y-5">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <ProjectForm project={project} />
              <AdminMutationForm
                action={deleteProjectAction}
                confirmMessage="Delete this project and its case study permanently?"
                submitLabel="Delete project"
              >
                <input name="id" type="hidden" value={project.id} />
              </AdminMutationForm>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

function ProjectForm({ project }: { project?: Project }) {
  return (
    <AdminMutationForm
      action={saveProjectAction}
      className="grid gap-4 md:grid-cols-2"
      submitLabel={project ? "Update project" : "Create project"}
    >
      <input name="id" type="hidden" value={project?.id ?? ""} />
      <AdminField
        defaultValue={project?.title}
        label="Title"
        name="title"
        required
      />
      <AdminField
        defaultValue={project?.slug}
        label="Slug"
        name="slug"
        required
      />
      <div className="md:col-span-2">
        <AdminTextarea
          defaultValue={project?.shortDescription}
          label="Short description"
          name="shortDescription"
          required
        />
      </div>
      <AdminField
        defaultValue={project?.projectType ?? undefined}
        label="Project type"
        name="projectType"
      />
      <AdminField
        defaultValue={project?.role ?? undefined}
        label="Role"
        name="role"
      />
      <label className="space-y-2 text-sm">
        <span className="font-medium">Status</span>
        <select
          className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
          defaultValue={project?.status ?? "DRAFT"}
          name="status"
        >
          <option value="DRAFT">Draft</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </label>
      <AdminField
        defaultValue={project?.sortOrder ?? 0}
        label="Sort order"
        name="sortOrder"
        type="number"
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
          label="Featured"
          name="featured"
        />
        <AdminCheckbox
          defaultChecked={project?.visible ?? false}
          label="Visible"
          name="visible"
        />
      </div>
    </AdminMutationForm>
  );
}
