"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  deleteSkill,
  deleteSocialLink,
  deleteUseItem,
  saveSkill,
  saveSkillCategory,
  saveSocialLink,
  saveUseItem,
} from "@/features/taxonomy/taxonomy.service";
import { requireAdmin } from "@/lib/auth/session";
import {
  failure,
  idSchema,
  optionalUrlSchema,
  slugSchema,
  success,
} from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

const categorySchema = z.object({
  id: z.union([idSchema, z.literal("")]),
  name: z.string().trim().min(2).max(100),
  slug: slugSchema,
  description: z.string().trim().max(500),
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

export async function saveSkillCategoryAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    id: formData.get("id") ?? "",
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return failure("Skill category validation failed.");
  const { id, ...values } = parsed.data;
  const data = {
    ...values,
    description: values.description || null,
    visible: formData.get("visible") === "on",
  };
  await saveSkillCategory(id, data);
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
  return success("Skill category saved.");
}

const skillSchema = z.object({
  id: z.union([idSchema, z.literal("")]),
  categoryId: idSchema,
  name: z.string().trim().min(1).max(100),
  slug: slugSchema,
  proficiency: z.union([
    z.coerce.number().int().min(0).max(100),
    z.literal(""),
  ]),
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

export async function saveSkillAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = skillSchema.safeParse({
    id: formData.get("id") ?? "",
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    proficiency: formData.get("proficiency") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return failure("Skill validation failed.");
  const { id, proficiency, ...values } = parsed.data;
  const data = {
    ...values,
    proficiency: proficiency === "" ? null : proficiency,
    highlighted: formData.get("highlighted") === "on",
    visible: formData.get("visible") === "on",
  };
  await saveSkill(id, data);
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
  return success("Skill saved.");
}

export async function deleteSkillAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid skill.");
  await deleteSkill(id.data);
  revalidatePath("/skills");
  revalidatePath("/admin/skills");
  return success("Skill deleted.");
}

const socialSchema = z.object({
  id: z.union([idSchema, z.literal("")]),
  platform: z.string().trim().min(2).max(80),
  label: z.string().trim().min(2).max(100),
  url: z.url(),
  icon: z.string().trim().max(80),
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

export async function saveSocialLinkAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = socialSchema.safeParse({
    id: formData.get("id") ?? "",
    platform: formData.get("platform"),
    label: formData.get("label"),
    url: formData.get("url"),
    icon: formData.get("icon"),
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return failure("Social-link validation failed.");
  const { id, ...values } = parsed.data;
  const data = {
    ...values,
    icon: values.icon || null,
    visible: formData.get("visible") === "on",
  };
  await saveSocialLink(id, data);
  revalidatePath("/", "layout");
  revalidatePath("/admin/social-links");
  return success("Social link saved.");
}

export async function deleteSocialLinkAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid social link.");
  await deleteSocialLink(id.data);
  revalidatePath("/", "layout");
  revalidatePath("/admin/social-links");
  return success("Social link deleted.");
}

const useItemSchema = z.object({
  id: z.union([idSchema, z.literal("")]),
  category: z.string().trim().min(2).max(100),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000),
  url: optionalUrlSchema,
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

export async function saveUseItemAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = useItemSchema.safeParse({
    id: formData.get("id") ?? "",
    category: formData.get("category"),
    name: formData.get("name"),
    description: formData.get("description"),
    url: formData.get("url") ?? "",
    sortOrder: formData.get("sortOrder") ?? 0,
  });
  if (!parsed.success) return failure("Uses-item validation failed.");
  const { id, ...values } = parsed.data;
  const data = {
    ...values,
    description: values.description || null,
    visible: formData.get("visible") === "on",
  };
  await saveUseItem(id, data);
  revalidatePath("/uses");
  revalidatePath("/admin/uses");
  return success("Uses item saved.");
}

export async function deleteUseItemAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid uses item.");
  await deleteUseItem(id.data);
  revalidatePath("/uses");
  revalidatePath("/admin/uses");
  return success("Uses item deleted.");
}
