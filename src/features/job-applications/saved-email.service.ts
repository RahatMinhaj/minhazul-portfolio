import "server-only";

import * as repository from "@/features/job-applications/saved-email.repository";

export async function listSavedRecipientEmails(query?: string) {
  return repository.listRecipientEmailSuggestions(query, 40);
}

export async function rememberSavedRecipientEmail(
  email: string,
  options: { bumpUseCount?: boolean } = {},
) {
  return repository.rememberRecipientEmail(email, options);
}

export async function deleteSavedRecipientEmail(email: string) {
  return repository.deleteRecipientEmail(email);
}
