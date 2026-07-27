import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  subject: z.string().trim().min(3, "Add a short subject.").max(160),
  message: z
    .string()
    .trim()
    .min(20, "The message must contain at least 20 characters.")
    .max(5000),
  company: z.string().max(0).optional(),
});

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  };
};
