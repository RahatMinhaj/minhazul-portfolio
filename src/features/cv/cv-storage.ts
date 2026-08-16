import "server-only";

import {
  mkdir,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

export const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024;
export const CV_DOWNLOAD_NAME = "minhazul-islam-resume.pdf";

function cvFilePath() {
  const storageDirectory =
    process.env.CV_STORAGE_DIR ?? path.join(process.cwd(), "uploads", "cv");

  return path.join(storageDirectory, "current.pdf");
}

export async function getCvMetadata() {
  try {
    const details = await stat(cvFilePath());
    return {
      sizeBytes: details.size,
      updatedAt: details.mtime,
    };
  } catch (error) {
    if (isMissingFileError(error)) return null;
    throw error;
  }
}

export async function readCv() {
  try {
    return await readFile(cvFilePath());
  } catch (error) {
    if (isMissingFileError(error)) return null;
    throw error;
  }
}

export async function replaceCv(file: File) {
  if (file.size === 0 || file.size > MAX_CV_SIZE_BYTES) {
    throw new Error("The CV must be a non-empty PDF no larger than 10 MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("The selected file is not a valid PDF.");
  }

  const target = cvFilePath();
  const directory = path.dirname(target);
  const temporary = path.join(directory, `upload-${crypto.randomUUID()}.tmp`);

  await mkdir(directory, { recursive: true });
  await writeFile(temporary, bytes, { mode: 0o600 });
  await rename(temporary, target);
}

export async function deleteCv() {
  try {
    await unlink(cvFilePath());
  } catch (error) {
    if (!isMissingFileError(error)) throw error;
  }
}

function isMissingFileError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
