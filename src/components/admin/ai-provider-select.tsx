"use client";

import type { AiProviderPreference } from "@/features/job-applications/job-application-types";

const OPTIONS: Array<{
  value: Exclude<AiProviderPreference, "auto">;
  label: string;
  description: string;
}> = [
  {
    value: "gemini",
    label: "Gemini",
    description: "Primary Google model",
  },
  {
    value: "openrouter",
    label: "OpenRouter (free)",
    description: "Free OpenRouter model",
  },
];

export function AiProviderSelect({
  defaultValue = "gemini",
  name = "aiProvider",
}: {
  defaultValue?: Exclude<AiProviderPreference, "auto">;
  name?: string;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">AI provider</legend>
      <div className="flex flex-wrap gap-3">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex min-w-[11rem] cursor-pointer items-start gap-2.5 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-sm has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--surface-raised)]"
          >
            <input
              className="mt-0.5"
              defaultChecked={defaultValue === option.value}
              name={name}
              required
              type="radio"
              value={option.value}
            />
            <span>
              <span className="block font-medium">{option.label}</span>
              <span className="block text-xs text-[var(--muted)]">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
