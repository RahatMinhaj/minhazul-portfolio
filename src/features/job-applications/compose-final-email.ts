import { plainTextToHtml } from "@/lib/content/rich-text";

export function assembleFinalEmailHtml({
  bodyHtml,
  coverLetter,
  signatureHtml,
  includeCoverLetter,
  includeSignature,
}: {
  bodyHtml: string;
  coverLetter?: string;
  signatureHtml?: string;
  includeCoverLetter: boolean;
  includeSignature: boolean;
}) {
  const parts: string[] = [];
  const body = bodyHtml.trim();
  if (body) parts.push(body);

  if (includeCoverLetter && coverLetter?.trim()) {
    parts.push("<hr />", plainTextToHtml(coverLetter));
  }

  if (includeSignature && signatureHtml?.trim()) {
    parts.push("<hr />", signatureHtml.trim());
  }

  return parts.join("\n");
}
