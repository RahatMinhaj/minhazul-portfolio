"use server";

import { redirect } from "next/navigation";

import { authenticateAdministrator } from "@/features/auth/auth.service";
import { createAdminSession, revokeCurrentSession } from "@/lib/auth/session";
import { loginSchema, type LoginState } from "@/lib/validation/auth";

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Review the highlighted fields.",
    };
  }

  const { username, password } = parsed.data;
  const result = await authenticateAdministrator(username, password);
  if (result.status === "blocked") {
    return {
      message:
        "Too many unsuccessful attempts. Wait 15 minutes before trying again.",
    };
  }

  if (result.status === "invalid") {
    return { message: "The username or password is incorrect." };
  }

  await createAdminSession(result.userId);
  redirect("/admin");
}

export async function logoutAction() {
  await revokeCurrentSession();
  redirect("/admin/login");
}
