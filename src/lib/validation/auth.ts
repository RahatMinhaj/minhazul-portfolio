import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Enter the administrator username.")
    .max(64),
  password: z.string().min(1, "Enter your password.").max(256),
});

export type LoginState = {
  message?: string;
  errors?: {
    username?: string[];
    password?: string[];
  };
};
