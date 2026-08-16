"use client";

import { createElement, useState } from "react";

import { SkillIcon } from "@/components/skills/skill-icon";
import { getLucideIcon, lucideIconOptions } from "@/lib/lucide-icon-options";

type IconSource = "library" | "upload" | "external" | "none";

export function AdminIconField({
  defaultValue,
  label = "Icon",
  name = "icon",
}: {
  defaultValue?: string | null;
  label?: string;
  name?: string;
}) {
  const initialOption = lucideIconOptions.find(
    (option) => option.icon === getLucideIcon(defaultValue),
  );
  const uploaded = defaultValue?.startsWith("/api/media/") ?? false;
  const [source, setSource] = useState<IconSource>(
    initialOption
      ? "library"
      : uploaded
        ? "upload"
        : defaultValue
          ? "external"
          : "library",
  );
  const [libraryKey, setLibraryKey] = useState(initialOption?.key ?? "");
  const [externalUrl, setExternalUrl] = useState(
    defaultValue && !initialOption && !uploaded ? defaultValue : "",
  );
  const value =
    source === "library"
      ? libraryKey
        ? `lucide:${libraryKey}`
        : ""
      : source === "external"
        ? externalUrl
        : source === "upload"
          ? (defaultValue ?? "")
          : "";
  const SelectedIcon = getLucideIcon(value);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{label}</legend>
      <input name={name} type="hidden" value={value} />
      <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
        <SourceOption
          checked={source === "library"}
          label="Icon dropdown"
          onChange={() => setSource("library")}
        />
        <SourceOption
          checked={source === "upload"}
          label="Upload"
          onChange={() => setSource("upload")}
        />
        <SourceOption
          checked={source === "external"}
          label="External URL"
          onChange={() => setSource("external")}
        />
        <SourceOption
          checked={source === "none"}
          label="No icon"
          onChange={() => setSource("none")}
        />
      </div>

      {source === "library" ? (
        <label className="block space-y-2 text-sm">
          <span className="text-[var(--muted)]">Choose a Lucide icon</span>
          <span className="flex items-center gap-3">
            {SelectedIcon ? (
              <span className="grid size-10 place-items-center rounded-md border border-[var(--border)] text-[var(--accent)]">
                {createElement(SelectedIcon, { "aria-hidden": true, size: 20 })}
              </span>
            ) : null}
            <select
              className="h-11 min-w-0 flex-1 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
              onChange={(event) => setLibraryKey(event.target.value)}
              value={libraryKey}
            >
              <option value="">Select an icon…</option>
              {lucideIconOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </span>
        </label>
      ) : null}

      {source === "upload" ? (
        <label className="block space-y-2 text-sm">
          <span className="text-[var(--muted)]">Upload icon image</span>
          {defaultValue ? (
            <SkillIcon className="size-10" name={label} value={defaultValue} />
          ) : null}
          <input
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="block w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--surface-raised)] file:px-3 file:py-2"
            name={`${name}Upload`}
            type="file"
          />
        </label>
      ) : null}

      {source === "external" ? (
        <label className="block space-y-2 text-sm">
          <span className="text-[var(--muted)]">External icon URL</span>
          <input
            className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 outline-none focus:border-[var(--accent)]"
            onChange={(event) => setExternalUrl(event.target.value)}
            placeholder="https://example.com/icon.svg"
            type="url"
            value={externalUrl}
          />
        </label>
      ) : null}
    </fieldset>
  );
}

function SourceOption({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input checked={checked} onChange={onChange} type="radio" />
      {label}
    </label>
  );
}
