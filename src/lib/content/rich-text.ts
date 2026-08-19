type RichTextNode = {
  type?: string;
  text?: string;
  root?: RichTextNode;
  children?: RichTextNode[];
  content?: RichTextNode[];
};

export type RichTextDocument = {
  root: RichTextNode & {
    type: "root";
    children: RichTextNode[];
  };
};

function isRichTextNode(value: unknown): value is RichTextNode {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function richTextToPlainText(value: unknown): string {
  if (!isRichTextNode(value)) return "";
  if (typeof value.text === "string") return value.text;

  if (isRichTextNode(value.root)) return richTextToPlainText(value.root);

  return (value.children ?? value.content ?? [])
    .map(richTextToPlainText)
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseRichTextDocument(value: unknown) {
  if (typeof value !== "string" || value.length > 1_000_000) return null;

  try {
    const document: unknown = JSON.parse(value);
    return isRichTextDocument(document) ? document : null;
  } catch {
    return null;
  }
}

export function isRichTextDocument(value: unknown): value is RichTextDocument {
  if (!isRichTextNode(value)) return false;
  return (
    isRichTextNode(value.root) &&
    value.root.type === "root" &&
    Array.isArray(value.root.children)
  );
}

export function richTextDocumentHasContent(document: RichTextDocument) {
  return richTextToPlainText(document).length > 0;
}
