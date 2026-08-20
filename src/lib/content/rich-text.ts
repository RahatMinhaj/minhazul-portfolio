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

export function htmlToLexicalJson(html: string): string {
  if (!html.trim()) return JSON.stringify(emptyDoc());

  const paragraphs = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const children = paragraphs.map((text) => ({
    children: [
      {
        detail: 0,
        format: 0,
        mode: "normal",
        style: "",
        text,
        type: "text",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    textFormat: 0,
    textStyle: "",
    type: "paragraph",
    version: 1,
  }));

  return JSON.stringify({
    root: {
      children: children.length ? children : [emptyParagraph()],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  });
}

export function lexicalJsonToHtml(json: string): string {
  try {
    const doc = JSON.parse(json);
    if (!doc?.root?.children) return json;
    return doc.root.children.map((node: LexicalNode) => nodeToHtml(node)).join("");
  } catch {
    return json;
  }
}

type LexicalNode = {
  type?: string;
  text?: string;
  format?: number;
  children?: LexicalNode[];
};

function nodeToHtml(node: LexicalNode): string {
  if (node.type === "text" && node.text != null) {
    let text = escapeHtml(node.text);
    if (node.format) {
      if (node.format & 1) text = `<strong>${text}</strong>`;
      if (node.format & 2) text = `<em>${text}</em>`;
      if (node.format & 8) text = `<u>${text}</u>`;
      if (node.format & 16) text = `<s>${text}</s>`;
    }
    return text;
  }

  const inner = (node.children ?? []).map(nodeToHtml).join("");

  switch (node.type) {
    case "paragraph":
      return `<p>${inner}</p>`;
    case "heading": {
      return `<h2>${inner}</h2>`;
    }
    case "list": {
      return `<ul>${inner}</ul>`;
    }
    case "listitem":
      return `<li>${inner}</li>`;
    case "quote":
      return `<blockquote>${inner}</blockquote>`;
    case "code":
      return `<pre><code>${inner}</code></pre>`;
    case "link":
      return inner;
    default:
      return inner;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emptyParagraph() {
  return {
    children: [],
    direction: null,
    format: "",
    indent: 0,
    textFormat: 0,
    textStyle: "",
    type: "paragraph",
    version: 1,
  };
}

function emptyDoc() {
  return {
    root: {
      children: [emptyParagraph()],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}
