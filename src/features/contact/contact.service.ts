import "server-only";

import { contactRepository } from "@/features/contact/contact.repository";

export class ContactRateLimitError extends Error {
  constructor() {
    super("The hourly message limit has been reached. Please try again later.");
    this.name = "ContactRateLimitError";
  }
}

export type ContactMessageInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function contactMessagingIsAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export async function createContactMessage(input: ContactMessageInput) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentMessages = await contactRepository.countSince(
    input.email,
    oneHourAgo,
  );

  if (recentMessages >= 3) throw new ContactRateLimitError();
  return contactRepository.create(input);
}
