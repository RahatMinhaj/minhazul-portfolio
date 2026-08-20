const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeRecipientEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidRecipientEmail(email: string) {
  return EMAIL_PATTERN.test(normalizeRecipientEmail(email));
}
