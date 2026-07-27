"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { saveProfile } from "@/features/profile/profile.service";
import { requireAdmin } from "@/lib/auth/session";
import { failure, success } from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  professionalTitle: z.string().trim().min(2).max(160),
  shortBio: z.string().trim().min(20).max(1000),
  email: z.union([z.email(), z.literal("")]),
  phone: z.string().trim().max(80),
  location: z.string().trim().max(160),
  availabilityStatus: z.string().trim().max(160),
  resumeUrl: z.union([z.url(), z.literal("")]),
  currentCompany: z.string().trim().max(160),
  currentRole: z.string().trim().max(160),
  currentFocus: z.string().trim().max(500),
});

export async function saveProfileAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    professionalTitle: formData.get("professionalTitle"),
    shortBio: formData.get("shortBio"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    location: formData.get("location"),
    availabilityStatus: formData.get("availabilityStatus"),
    resumeUrl: formData.get("resumeUrl"),
    currentCompany: formData.get("currentCompany"),
    currentRole: formData.get("currentRole"),
    currentFocus: formData.get("currentFocus"),
  });

  if (!parsed.success) {
    return failure("Profile validation failed. Review every field.");
  }

  const data = {
    ...parsed.data,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    location: parsed.data.location || null,
    availabilityStatus: parsed.data.availabilityStatus || null,
    resumeUrl: parsed.data.resumeUrl || null,
    currentCompany: parsed.data.currentCompany || null,
    currentRole: parsed.data.currentRole || null,
    currentFocus: parsed.data.currentFocus || null,
  };

  await saveProfile(data);

  revalidatePath("/", "layout");
  return success("Profile saved and public content revalidated.");
}
