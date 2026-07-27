import { AdminMutationForm } from "@/components/admin/admin-mutation-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateThemeAction } from "@/server/actions/admin-settings";
import { getAdminThemes } from "@/server/queries/admin-content";

export default async function AdminThemesPage() {
  const themes = await getAdminThemes();

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminPageHeader
        description="Activate or deactivate safe predefined themes and select the site default. Arbitrary CSS is never accepted."
        title="Themes"
      />
      <div className="grid gap-5 md:grid-cols-2">
        {themes.map((theme) => (
          <Card key={theme.id}>
            <CardHeader>
              <div className="mb-3 flex gap-2">
                <Badge variant={theme.active ? "default" : "neutral"}>
                  {theme.active ? "Active" : "Disabled"}
                </Badge>
                {theme.isDefault ? <Badge>Default</Badge> : null}
              </div>
              <CardTitle>{theme.name}</CardTitle>
              <CardDescription>{theme.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <AdminMutationForm
                action={updateThemeAction}
                submitLabel={theme.active ? "Disable" : "Enable"}
              >
                <input name="id" type="hidden" value={theme.id} />
                <input name="intent" type="hidden" value="toggle" />
              </AdminMutationForm>
              {!theme.isDefault ? (
                <AdminMutationForm
                  action={updateThemeAction}
                  submitLabel="Set default"
                >
                  <input name="id" type="hidden" value={theme.id} />
                  <input name="intent" type="hidden" value="default" />
                </AdminMutationForm>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
