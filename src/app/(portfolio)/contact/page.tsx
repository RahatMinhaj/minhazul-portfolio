import { notFound } from "next/navigation";

import { ContactHashRedirect } from "./contact-hash-redirect";
import { getPublicSiteSettings } from "@/server/queries/public-content";

export default async function ContactPage() {
  const settings = await getPublicSiteSettings();
  if (settings && !settings.contactEnabled) notFound();
  return <ContactHashRedirect />;
}
