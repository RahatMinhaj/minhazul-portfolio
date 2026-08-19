import "server-only";

import { z } from "zod";

import type { ActionState } from "@/types/action-state";

export const idSchema = z.cuid();
export const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const optionalUrlSchema = z
  .union([z.url(), z.literal("")])
  .transform((value) => value || null);

export function readStringList(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return [
    ...new Set(
      value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

export function success(message: string, data?: Record<string, unknown> | undefined): ActionState {
  const state: ActionState = { status: "success", message, version: Date.now() };
  if (data !== undefined) state.data = data;
  return state;
}

export function failure(message: string): ActionState {
  return { status: "error", message, version: Date.now() };
}

export function parseOptionalDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}
