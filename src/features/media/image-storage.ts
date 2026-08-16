import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { createMediaAsset } from "@/features/media/media.repository";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const imageTypes = {
  gif: "image/gif",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export async function storeUploadedImage(file: File, altText: string) {
  if (file.size === 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("The image must be non-empty and no larger than 5 MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) {
    throw new Error("Upload a valid PNG, JPEG, WebP, or GIF image.");
  }

  const id = crypto.randomUUID();
  const target = imageFilePath(id);
  const url = `/api/media/${id}`;

  await mkdir(/*turbopackIgnore: true*/ path.dirname(target), {
    recursive: true,
  });
  await writeFile(/*turbopackIgnore: true*/ target, bytes, {
    flag: "wx",
    mode: 0o600,
  });

  try {
    await createMediaAsset({
      id,
      provider: "server-upload",
      url,
      altText: altText.trim().slice(0, 500) || "Uploaded image",
      mimeType: imageTypes[type],
      sizeBytes: bytes.length,
    });
  } catch (error) {
    await unlink(/*turbopackIgnore: true*/ target).catch(() => undefined);
    throw error;
  }

  return url;
}

export async function resolveImageField(
  formData: FormData,
  name: string,
  altText: string,
  fallback: string | null,
) {
  const upload = formData.get(`${name}Upload`);
  if (upload instanceof File && upload.size > 0) {
    return storeUploadedImage(upload, altText);
  }

  return fallback;
}

export async function readUploadedImage(id: string) {
  try {
    return await readFile(/*turbopackIgnore: true*/ imageFilePath(id));
  } catch (error) {
    if (isMissingFileError(error)) return null;
    throw error;
  }
}

function imageFilePath(id: string) {
  const configuredDirectory = process.env.MEDIA_STORAGE_DIR;
  if (configuredDirectory) {
    return path.join(/*turbopackIgnore: true*/ configuredDirectory, id);
  }

  return path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    "uploads",
    "media",
    id,
  );
}

function detectImageType(bytes: Buffer): keyof typeof imageTypes | null {
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    return "png";
  }
  if (
    bytes.length >= 3 &&
    bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
  ) {
    return "jpeg";
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  if (
    bytes.length >= 6 &&
    ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii"))
  ) {
    return "gif";
  }

  return null;
}

function isMissingFileError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
