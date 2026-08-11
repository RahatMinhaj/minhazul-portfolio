import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import { ContactForm } from "@/components/forms/contact-form";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import {
  getPublicProfile,
  getPublicSiteSettings,
  getVisibleSocialLinks,
} from "@/server/queries/public-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a secure message about engineering opportunities.",
};

export default async function ContactPage() {
  const [profile, settings, socialLinks] = await Promise.all([
    getPublicProfile(),
    getPublicSiteSettings(),
    getVisibleSocialLinks(),
  ]);
  if (settings && !settings.contactEnabled) notFound();

  return (
    <main id="main-content">
      <PageHero
        description="Send a direct message for relevant engineering work, architecture discussions, or technical collaboration."
        eyebrow="Contact / Secure channel"
        status={profile?.availabilityStatus ?? "Open to conversations"}
        title="Start a useful conversation."
      />
      <Container className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-4">
          {profile?.email ? (
            <Card>
              <CardHeader>
                <Mail className="text-[var(--accent)]" aria-hidden size={19} />
                <CardDescription className="pt-5">Email</CardDescription>
                <a
                  className="text-base font-semibold hover:text-[var(--accent)]"
                  href={`mailto:${profile.email}`}
                >
                  {profile.email}
                </a>
              </CardHeader>
            </Card>
          ) : null}
          {profile?.location ? (
            <Card>
              <CardHeader>
                <MapPin
                  className="text-[var(--accent)]"
                  aria-hidden
                  size={19}
                />
                <CardDescription className="pt-5">Location</CardDescription>
                <p className="text-base font-semibold">{profile.location}</p>
              </CardHeader>
            </Card>
          ) : null}
          {socialLinks.length ? (
            <Card>
              <CardHeader>
                <CardDescription>Professional profiles</CardDescription>
                <div className="flex flex-wrap gap-3 pt-3">
                  {socialLinks.map((link) => (
                    <a
                      className="text-sm text-[var(--accent)]"
                      href={link.url}
                      key={link.id}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </CardHeader>
            </Card>
          ) : null}
        </aside>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">
              Send a message
            </h2>
            <CardDescription>
              Share the context, goal, and where thoughtful engineering support
              would be most useful.
            </CardDescription>
          </CardHeader>
          <div className="p-6 pt-4">
            <ContactForm />
          </div>
        </Card>
      </Container>
    </main>
  );
}
