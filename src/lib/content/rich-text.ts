type RichTextNode = {
  text?: string;
  content?: RichTextNode[];
};

function isRichTextNode(value: unknown): value is RichTextNode {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function richTextToPlainText(value: unknown): string {
  if (!isRichTextNode(value)) return "";
  if (typeof value.text === "string") return value.text;

  return (value.content ?? [])
    .map(richTextToPlainText)
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
