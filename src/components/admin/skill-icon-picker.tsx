"use client";

import { ExternalLink, Search, X } from "lucide-react";
import { useDeferredValue, useId, useState } from "react";
import simpleIcons from "simple-icons/icons.json";

import { SkillIcon } from "@/components/skills/skill-icon";
import { getSimpleIconSlug, SIMPLE_ICON_PREFIX } from "@/lib/skill-icons";

type PickerMode = "library" | "upload" | "external" | "none";

const icons = simpleIcons.map(({ hex, slug, title }) => ({ hex, slug, title }));

export function SkillIconPicker({
  defaultValue,
  name = "icon",
}: {
  defaultValue?: string | null;
  name?: string;
}) {
  const initialSlug = getSimpleIconSlug(defaultValue);
  const initialIcon = icons.find((icon) => icon.slug === initialSlug);
  const initiallyUploaded = defaultValue?.startsWith("/api/media/") ?? false;
  const [mode, setMode] = useState<PickerMode>(
    initialSlug
      ? "library"
      : initiallyUploaded
        ? "upload"
        : defaultValue
          ? "external"
          : "library",
  );
  const [selectedIcon, setSelectedIcon] = useState(initialIcon ?? null);
  const [externalUrl, setExternalUrl] = useState(
    defaultValue && !initialSlug ? defaultValue : "",
  );
  const [query, setQuery] = useState(initialIcon?.title ?? "");
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const matches = normalizedQuery
    ? icons
        .filter(
          (icon) =>
            icon.title.toLowerCase().includes(normalizedQuery) ||
            icon.slug.includes(normalizedQuery),
        )
        .slice(0, 12)
    : icons.slice(0, 12);
  const value =
    mode === "library" && selectedIcon
      ? `${SIMPLE_ICON_PREFIX}${selectedIcon.slug}`
      : mode === "external"
        ? externalUrl
        : mode === "upload"
          ? (defaultValue ?? "")
          : "";

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">Logo · optional</legend>
      <input name={name} type="hidden" value={value} />
      <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
        <ModeOption
          checked={mode === "library"}
          label="Icon library"
          onChange={() => setMode("library")}
        />
        <ModeOption
          checked={mode === "upload"}
          label="Upload"
          onChange={() => setMode("upload")}
        />
        <ModeOption
          checked={mode === "external"}
          label="External URL"
          onChange={() => setMode("external")}
        />
        <ModeOption
          checked={mode === "none"}
          label="No logo"
          onChange={() => setMode("none")}
        />
      </div>

      {mode === "library" ? (
        <div className="relative">
          <label className="sr-only" htmlFor={inputId}>
            Search Simple Icons
          </label>
          <div className="flex h-11 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 focus-within:border-[var(--accent)]">
            {selectedIcon ? (
              <SkillIcon
                className="size-7"
                name={selectedIcon.title}
                value={`${SIMPLE_ICON_PREFIX}${selectedIcon.slug}`}
              />
            ) : (
              <Search className="text-[var(--muted)]" aria-hidden size={16} />
            )}
            <input
              aria-autocomplete="list"
              aria-controls={`${inputId}-options`}
              aria-expanded={open}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              id={inputId}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedIcon(null);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
              }}
              placeholder="Search Java, Spring, React…"
              role="combobox"
              type="search"
              value={query}
            />
            {query ? (
              <button
                aria-label="Clear icon selection"
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
                onClick={() => {
                  setQuery("");
                  setSelectedIcon(null);
                  setOpen(true);
                }}
                type="button"
              >
                <X aria-hidden size={15} />
              </button>
            ) : null}
          </div>
          {open ? (
            <div
              className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] p-1 shadow-xl"
              id={`${inputId}-options`}
              role="listbox"
            >
              {matches.length ? (
                matches.map((icon) => (
                  <button
                    aria-selected={selectedIcon?.slug === icon.slug}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-[var(--surface-raised)]"
                    key={icon.slug}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setSelectedIcon(icon);
                      setQuery(icon.title);
                      setOpen(false);
                    }}
                    role="option"
                    type="button"
                  >
                    <span className="grid size-8 place-items-center rounded-md bg-white p-1.5">
                      {/* Simple Icons CDN provides previews without bundling thousands of SVG paths. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        className="size-full object-contain"
                        src={`https://cdn.simpleicons.org/${icon.slug}/${icon.hex}`}
                      />
                    </span>
                    <span>
                      <span className="block font-medium">{icon.title}</span>
                      <span className="block font-mono text-[10px] text-[var(--muted)]">
                        {icon.slug}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-5 text-center text-sm text-[var(--muted)]">
                  No library icon found. Choose External URL above.
                </p>
              )}
            </div>
          ) : null}
          <p className="mt-2 text-xs text-[var(--muted)]">
            Search thousands of brand logos from Simple Icons.
          </p>
        </div>
      ) : null}

      {mode === "external" ? (
        <label className="space-y-2 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <ExternalLink aria-hidden size={14} /> External image URL
          </span>
          <input
            className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 outline-none focus:border-[var(--accent)]"
            onChange={(event) => setExternalUrl(event.target.value)}
            placeholder="https://example.com/logo.svg"
            type="url"
            value={externalUrl}
          />
          <span className="block text-xs leading-5 text-[var(--muted)]">
            Use a stable HTTPS SVG, PNG, or WebP URL from a source you trust.
          </span>
        </label>
      ) : null}

      {mode === "upload" ? (
        <label className="block space-y-2 text-sm">
          <span className="font-medium">Upload logo</span>
          {defaultValue ? (
            <SkillIcon
              className="size-10"
              name="Current logo"
              value={defaultValue}
            />
          ) : null}
          <input
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="block w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--surface-raised)] file:px-3 file:py-2"
            name={`${name}Upload`}
            type="file"
          />
          <span className="block text-xs leading-5 text-[var(--muted)]">
            PNG, JPEG, WebP, or GIF; maximum 5 MB. A new file replaces the
            current logo selection.
          </span>
        </label>
      ) : null}
    </fieldset>
  );
}

function ModeOption({
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
