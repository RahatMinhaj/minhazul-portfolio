import "server-only";

import { getDatabase } from "@/lib/db/client";
import {
  isValidRecipientEmail,
  normalizeRecipientEmail,
} from "@/features/job-applications/saved-email";

export { isValidRecipientEmail, normalizeRecipientEmail };

/** Remember an address for compose suggestions. Bump useCount when actually sent. */
export async function rememberRecipientEmail(
  email: string,
  options: { bumpUseCount?: boolean } = {},
) {
  const normalized = normalizeRecipientEmail(email);
  if (!isValidRecipientEmail(normalized)) {
    return { ok: false as const, message: "Invalid email address." };
  }

  const db = getDatabase();
  const existing = await db.savedEmail.findUnique({
    where: { email: normalized },
  });

  if (existing) {
    if (options.bumpUseCount) {
      await db.savedEmail.update({
        where: { email: normalized },
        data: { useCount: { increment: 1 } },
      });
    }
    return { ok: true as const, email: normalized, created: false };
  }

  await db.savedEmail.create({
    data: { email: normalized },
  });
  return { ok: true as const, email: normalized, created: true };
}

export async function deleteRecipientEmail(email: string) {
  const normalized = normalizeRecipientEmail(email);
  const db = getDatabase();
  await db.savedEmail.deleteMany({ where: { email: normalized } });
  return { ok: true as const };
}

/**
 * Suggestions for the compose "To" field:
 * SavedEmail first (by useCount), then historical application/delivery addresses.
 */
export async function listRecipientEmailSuggestions(query?: string, limit = 40) {
  const db = getDatabase();
  const q = query?.trim().toLowerCase() || undefined;

  const emailFilter = q
    ? { contains: q, mode: "insensitive" as const }
    : undefined;

  const [saved, recipients, deliveries] = await Promise.all([
    db.savedEmail.findMany({
      ...(emailFilter ? { where: { email: emailFilter } } : {}),
      orderBy: [{ useCount: "desc" }, { updatedAt: "desc" }],
      take: limit,
      select: { email: true },
    }),
    db.jobApplication.findMany({
      where: q
        ? {
            recipientEmail: {
              not: null,
              contains: q,
              mode: "insensitive",
            },
          }
        : { recipientEmail: { not: null } },
      select: { recipientEmail: true },
      take: limit * 2,
      orderBy: { updatedAt: "desc" },
    }),
    db.jobApplicationDelivery.findMany({
      ...(emailFilter ? { where: { toAddress: emailFilter } } : {}),
      select: { toAddress: true },
      take: limit * 2,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const seen = new Set<string>();
  const emails: string[] = [];

  function push(raw: string | null | undefined) {
    if (!raw) return;
    const email = normalizeRecipientEmail(raw);
    if (!isValidRecipientEmail(email) || seen.has(email)) return;
    seen.add(email);
    emails.push(email);
  }

  for (const row of saved) push(row.email);
  for (const row of recipients) push(row.recipientEmail);
  for (const row of deliveries) push(row.toAddress);

  return emails.slice(0, limit);
}
