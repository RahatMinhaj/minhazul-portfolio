"use server";

import { revalidatePath } from "next/cache";

import {
  ContactRateLimitError,
  contactMessagingIsAvailable,
  createContactMessage,
} from "@/features/contact/contact.service";
import { contactSchema, type ContactState } from "@/lib/validation/contact";

export async function submitContactMessage(
  _previousState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    company: formData.get("company"),
  });

  if (!parsed.success) {
    if (formData.get("company")) {
      return {
        status: "success",
        message: "Your message was received.",
      };
    }

    return {
      status: "error",
      message: "Review the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!contactMessagingIsAvailable()) {
    return {
      status: "error",
      message:
        "Messaging is not configured yet. Please use a verified social link when one becomes available.",
    };
  }

  try {
    await createContactMessage({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });
  } catch (error) {
    if (!(error instanceof ContactRateLimitError)) throw error;
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath("/admin/contact-messages");

  return {
    status: "success",
    message: "Message stored securely. Thank you for getting in touch.",
  };
}
