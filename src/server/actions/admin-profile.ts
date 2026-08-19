"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { saveProfile } from "@/features/profile/profile.service";
import { heroDeveloperCodeSchema } from "@/features/profile/hero-content";
import { requireAdmin } from "@/lib/auth/session";
import { failure, success } from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";
import {
  parseRichTextDocument,
  richTextDocumentHasContent,
} from "@/lib/content/rich-text";

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  professionalTitle: z.string().trim().min(2).max(160),
  shortBio: z.string().trim().min(20).max(1000),
  email: z.union([z.email(), z.literal("")]),
  phone: z.string().trim().max(80),
  location: z.string().trim().max(160),
  availabilityStatus: z.string().trim().max(160),
  currentCompany: z.string().trim().max(160),
  currentRole: z.string().trim().max(160),
  currentFocus: z.string().trim().max(500),
  yearsOfExperience: z.preprocess(
    (value) => (value === "" ? null : value),
    z.coerce.number().min(0).max(99).nullable(),
  ),
  heroCodeFileLabel: heroDeveloperCodeSchema.shape.fileLabel,
  heroCodeVariableName: heroDeveloperCodeSchema.shape.variableName,
  heroCodeProperties: z.preprocess((value) => {
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }, heroDeveloperCodeSchema.shape.properties),
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
    currentCompany: formData.get("currentCompany"),
    currentRole: formData.get("currentRole"),
    currentFocus: formData.get("currentFocus"),
    yearsOfExperience: formData.get("yearsOfExperience") ?? "",
    heroCodeFileLabel: formData.get("heroCodeFileLabel"),
    heroCodeVariableName: formData.get("heroCodeVariableName"),
    heroCodeProperties: formData.get("heroCodeProperties"),
  });

  if (!parsed.success) {
    return failure("Profile validation failed. Review every field.");
  }

  const longBio = parseRichTextDocument(formData.get("longBio"));
  if (!longBio) return failure("Full biography contains invalid rich text.");

  const {
    heroCodeFileLabel,
    heroCodeProperties,
    heroCodeVariableName,
    ...profileData
  } = parsed.data;
  const data = {
    ...profileData,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    location: parsed.data.location || null,
    availabilityStatus: parsed.data.availabilityStatus || null,
    currentCompany: parsed.data.currentCompany || null,
    currentRole: parsed.data.currentRole || null,
    currentFocus: parsed.data.currentFocus || null,
    yearsOfExperience: parsed.data.yearsOfExperience,
    longBio: richTextDocumentHasContent(longBio)
      ? (longBio as Prisma.InputJsonValue)
      : Prisma.DbNull,
    heroContent: {
      developerCode: {
        fileLabel: heroCodeFileLabel,
        variableName: heroCodeVariableName,
        properties: heroCodeProperties,
      },
    },
  };

  await saveProfile(data);

  revalidatePath("/", "layout");
  return success("Profile saved and public content revalidated.");
}
