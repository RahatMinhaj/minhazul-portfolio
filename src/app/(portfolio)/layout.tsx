import { PageTransition } from "@/components/animations/page-transition";
import { connection } from "next/server";
import Link from "next/link";
import { Eye, Settings } from "lucide-react";
import { VisitorTracker } from "@/components/analytics/visitor-tracker";
import { PortfolioChatbot } from "@/components/chat/portfolio-chatbot";
import { SiteFooter } from "@/components/layout/site-footer";
import { PublicShell } from "@/components/navigation/public-shell";
import { StructuredData } from "@/components/seo/structured-data";
import { ThemeProvider } from "@/components/themes/theme-provider";
import { siteConfig } from "@/config/site";
import { getPublicNavigation } from "@/config/navigation";
import { defaultTheme, themeIds, type ThemeId } from "@/config/themes";
import { portfolioChatIsAvailable } from "@/features/chat/chat.service";
import { getCurrentAdmin } from "@/lib/auth/session";
import {
  getActiveThemes,
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
  await connection();

  const [activeThemes, profile, projects, settings, socialLinks] =
    await Promise.all([
      getActiveThemes(),
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
  const configuredDefaultTheme = activeThemes.find(
    (theme) =>
      theme.isDefault && availableThemes.includes(theme.slug as ThemeId),
  )?.slug as ThemeId | undefined;
  const siteDefaultTheme = configuredDefaultTheme ?? defaultTheme;
  const navigation = getPublicNavigation(settings);
  const siteName = profile?.fullName ?? settings?.siteName ?? siteConfig.name;
  const admin = settings?.maintenanceMode ? await getCurrentAdmin() : null;

  if (settings?.maintenanceMode && !admin) {
    return (
      <ThemeProvider defaultTheme={siteDefaultTheme}>
        <main
          id="main-content"
          className="relative grid min-h-dvh place-items-center overflow-hidden px-5 text-center"
        >
          <div
            className="theme-environment absolute inset-0 -z-10"
            aria-hidden
          />
          <div className="max-w-2xl rounded-[var(--radius-card)] border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] p-8 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-12">
            <p className="eyebrow">Site maintenance</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
              Something polished is on the way.
            </h1>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-[var(--muted)]">
              {siteName} is currently being prepared with updated projects,
              experience, and technical work. Please check back soon.
            </p>
            <div className="mx-auto mt-8 h-px w-24 bg-[var(--accent)]" />
          </div>
        </main>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme={siteDefaultTheme}>
      <PublicShell
        availableThemes={availableThemes}
        navigation={navigation}
        projectCommands={projects.map((project) => ({
          label: project.title,
          href: `/projects/${project.slug}`,
        }))}
        socialCommands={socialLinks.map((link) => ({
          label: link.label,
          href: link.url,
        }))}
        siteName={siteName}
      >
        {settings?.maintenanceMode ? (
          <aside className="flex flex-wrap items-center justify-center gap-3 border-b border-amber-400/30 bg-amber-400/10 px-5 py-2.5 text-center text-xs text-[var(--foreground)]">
            <Eye aria-hidden size={15} />
            <span>
              Administrator preview: visitors currently see the maintenance
              page.
            </span>
            <Link
              className="inline-flex items-center gap-1.5 font-semibold text-[var(--accent)] hover:underline"
              href="/admin/settings"
            >
              <Settings aria-hidden size={13} /> Manage
            </Link>
          </aside>
        ) : null}
        <PageTransition>{children}</PageTransition>
        <SiteFooter
          footerText={settings?.footerText}
          navigation={navigation}
          siteName={siteName}
        />
        {portfolioChatIsAvailable() ? <PortfolioChatbot /> : null}
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
    </ThemeProvider>
  );
}
