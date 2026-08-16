"use client";

import { useState } from "react";

type ImageSource = "library" | "upload" | "external" | "none";

type MediaOption = {
  altText: string;
  url: string;
};

export function AdminImageField({
  defaultValue,
  label,
  media,
  name,
}: {
  defaultValue?: string | null | undefined;
  label: string;
  media: MediaOption[];
  name: string;
}) {
  const initialLibraryValue = media.some((asset) => asset.url === defaultValue)
    ? (defaultValue ?? "")
    : "";
  const [source, setSource] = useState<ImageSource>(
    initialLibraryValue ? "library" : defaultValue ? "external" : "library",
  );
  const [libraryValue, setLibraryValue] = useState(initialLibraryValue);
  const [externalValue, setExternalValue] = useState(
    defaultValue && !initialLibraryValue ? defaultValue : "",
  );
  const value =
    source === "library"
      ? libraryValue
      : source === "external"
        ? externalValue
        : source === "upload"
          ? (defaultValue ?? "")
          : "";

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{label}</legend>
      <input name={name} type="hidden" value={value} />
      <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
        <SourceOption
          checked={source === "library"}
          label="Media library"
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
          label="No image"
          onChange={() => setSource("none")}
        />
      </div>

      {source === "library" ? (
        <label className="block space-y-2 text-sm">
          <span className="text-[var(--muted)]">Choose existing media</span>
          <select
            className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5"
            onChange={(event) => setLibraryValue(event.target.value)}
            value={libraryValue}
          >
            <option value="">Select an image…</option>
            {media.map((asset) => (
              <option key={asset.url} value={asset.url}>
                {asset.altText}
              </option>
            ))}
          </select>
          {libraryValue ? <ImagePreview src={libraryValue} /> : null}
          {media.length === 0 ? (
            <span className="block text-xs text-[var(--muted)]">
              The Media library is empty. Upload here or add media from the
              Media page.
            </span>
          ) : null}
        </label>
      ) : null}

      {source === "upload" ? (
        <label className="block space-y-2 text-sm">
          <span className="text-[var(--muted)]">Upload from this device</span>
          {defaultValue ? <ImagePreview src={defaultValue} /> : null}
          <input
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="block w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] p-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--surface-raised)] file:px-3 file:py-2 file:text-[var(--foreground)]"
            name={`${name}Upload`}
            type="file"
          />
          <span className="block text-xs text-[var(--muted)]">
            PNG, JPEG, WebP, or GIF; maximum 5 MB.
          </span>
        </label>
      ) : null}

      {source === "external" ? (
        <label className="block space-y-2 text-sm">
          <span className="text-[var(--muted)]">External image URL</span>
          <input
            className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 outline-none focus:border-[var(--accent)]"
            onChange={(event) => setExternalValue(event.target.value)}
            placeholder="https://example.com/image.png"
            type="url"
            value={externalValue}
          />
          {externalValue ? <ImagePreview src={externalValue} /> : null}
        </label>
      ) : null}
    </fieldset>
  );
}

function ImagePreview({ src }: { src: string }) {
  return (
    <span className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--border)] p-2.5">
      {/* The administrator controls local or remote image sources. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        className="size-10 rounded-md border border-[var(--border)] bg-white object-contain p-1"
        src={src}
      />
      <span className="min-w-0 truncate text-xs text-[var(--muted)]">
        {src}
      </span>
    </span>
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
