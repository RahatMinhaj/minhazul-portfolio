import type { Project } from "@/generated/prisma/client";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectFormFields } from "@/components/admin/project-form-fields";
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
      {project ? <ProjectFormFields project={project} /> : <ProjectFormFields />}
    </AdminMutationForm>
  );
}
