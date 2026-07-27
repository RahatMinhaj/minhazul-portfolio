import { PageTransition } from "@/components/animations/page-transition";
import { VisitorTracker } from "@/components/analytics/visitor-tracker";
import { SiteFooter } from "@/components/layout/site-footer";
import { PublicShell } from "@/components/navigation/public-shell";
import { StructuredData } from "@/components/seo/structured-data";
import { CustomCursor } from "@/components/widgets/custom-cursor";
import { siteConfig } from "@/config/site";
import { defaultTheme, themeIds, type ThemeId } from "@/config/themes";
import {
  getActiveThemeSlugs,
  getPublicProfile,
  getPublicSiteSettings,
  getVisibleProjects,
  getVisibleSocialLinks,
} from "@/server/queries/public-content";

export default async function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeThemes, profile, projects, settings, socialLinks] =
    await Promise.all([
      getActiveThemeSlugs(),
      getPublicProfile(),
      getVisibleProjects(),
      getPublicSiteSettings(),
      getVisibleSocialLinks(),
    ]);
  const configuredThemes = activeThemes
    .map((theme) => theme.slug)
    .filter((slug): slug is ThemeId => themeIds.includes(slug as ThemeId));
  const availableThemes = configuredThemes.length
    ? configuredThemes
    : [defaultTheme];

  if (settings?.maintenanceMode) {
    return (
      <main
        id="main-content"
        className="grid min-h-[80dvh] place-items-center px-5 text-center"
      >
        <div className="max-w-2xl">
          <p className="eyebrow">Maintenance mode</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">
            The portfolio is receiving an update.
          </h1>
          <p className="mt-5 text-[var(--muted)]">
            Please check back after the current maintenance window.
          </p>
        </div>
      </main>
    );
  }

  return (
    <PublicShell
      availableThemes={availableThemes}
      projectCommands={projects.map((project) => ({
        label: project.title,
        href: `/projects/${project.slug}`,
      }))}
      socialCommands={socialLinks.map((link) => ({
        label: link.label,
        href: link.url,
      }))}
    >
      <PageTransition>{children}</PageTransition>
      <SiteFooter footerText={settings?.footerText} />
      <CustomCursor />
      {settings?.analyticsEnabled ? <VisitorTracker /> : null}
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            description: siteConfig.description,
            url: siteConfig.url,
          },
          ...(profile
            ? [
                {
                  "@context": "https://schema.org",
                  "@type": "Person",
                  name: profile.fullName,
                  jobTitle: profile.professionalTitle,
                  description: profile.shortBio,
                  email: profile.email ?? undefined,
                  url: siteConfig.url,
                  sameAs: socialLinks.map((link) => link.url),
                },
              ]
            : []),
        ]}
      />
    </PublicShell>
  );
}
