import { registerCvDownload } from "@/features/cv/cv-download-limit";
import {
  CV_DOWNLOAD_NAME,
  getCvMetadata,
  readCv,
} from "@/features/cv/cv-storage";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";
  const [file, metadata] = await Promise.all([readCv(), getCvMetadata()]);

  if (!file || !metadata) {
    return new Response("Resume not found.", { status: 404 });
  }

  if (download) {
    const rateLimit = await registerCvDownload(request);
    if (!rateLimit.allowed) {
      return new Response(
        "Too many resume downloads. Please use the preview and try again later.",
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        },
      );
    }
  }

  const etag = `"${metadata.sizeBytes}-${metadata.updatedAt.getTime()}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  const range = download
    ? null
    : parseRange(request.headers.get("range"), file.length);
  const body = range ? file.subarray(range.start, range.end + 1) : file;
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600, must-revalidate",
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${CV_DOWNLOAD_NAME}"`,
    "Content-Length": String(body.length),
    "Content-Type": "application/pdf",
    ETag: etag,
    "Last-Modified": metadata.updatedAt.toUTCString(),
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow",
  });

  if (range) {
    headers.set(
      "Content-Range",
      `bytes ${range.start}-${range.end}/${file.length}`,
    );
  }

  return new Response(body, { status: range ? 206 : 200, headers });
}

function parseRange(value: string | null, size: number) {
  const match = value?.match(/^bytes=(\d+)-(\d*)$/);
  if (!match) return null;

  const start = Number(match[1]);
  const requestedEnd = match[2] ? Number(match[2]) : size - 1;
  const end = Math.min(requestedEnd, size - 1);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) {
    return null;
  }

  return { start, end };
}
