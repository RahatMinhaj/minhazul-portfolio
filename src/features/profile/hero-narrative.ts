export type HeroTextSegment = {
  text: string;
  highlighted: boolean;
};

export function richTextToParagraphs(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  if (!isRecord(value)) return [];

  if (isBlockParagraph(value)) {
    const text = collectInlineText(value).replace(/\s+/g, " ").trim();
    return text ? [text] : [];
  }

  return getChildNodes(value).flatMap(richTextToParagraphs);
}

export function resolveHeroParagraphs({
  longBio,
  shortBio,
}: {
  longBio?: unknown;
  shortBio: string;
}) {
  const fromLongBio = richTextToParagraphs(longBio);
  if (fromLongBio.length) return fromLongBio;

  const fallback = shortBio.trim();
  return fallback ? [fallback] : [];
}

export function splitHeroTextSegments(
  text: string,
  highlightTerms: readonly string[] = [],
): HeroTextSegment[] {
  const terms = uniqueHighlightTerms(highlightTerms);
  if (!terms.length) return [{ text, highlighted: false }];

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const segments: HeroTextSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      segments.push({ text: text.slice(cursor, index), highlighted: false });
    }
    segments.push({ text: match[0], highlighted: true });
    cursor = index + match[0].length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }

  return segments.length ? segments : [{ text, highlighted: false }];
}

function uniqueHighlightTerms(terms: readonly string[]) {
  const seen = new Set<string>();
  return terms
    .map((term) => term.trim())
    .filter((term) => term.length > 1)
    .sort((a, b) => b.length - a.length)
    .filter((term) => {
      const key = term.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isBlockParagraph(value: Record<string, unknown>) {
  return (
    value.type === "paragraph" ||
    value.type === "quote" ||
    value.type === "heading"
  );
}

function getChildNodes(value: Record<string, unknown>): unknown[] {
  if (isRecord(value.root)) return getChildNodes(value.root);
  if (Array.isArray(value.children)) return value.children;
  if (Array.isArray(value.content)) return value.content;
  return [];
}

function collectInlineText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return "";
  if (typeof value.text === "string") return value.text;

  return getChildNodes(value).map(collectInlineText).join("");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
