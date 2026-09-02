type RichTextNode = {
  type?: string;
  tag?: string;
  text?: string;
  url?: string;
  format?: number | string;
  listType?: string;
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

export const TEXT_FORMAT = {
  bold: 1,
  italic: 2,
  strikethrough: 4,
  underline: 8,
  code: 16,
} as const;

function isRichTextNode(value: unknown): value is RichTextNode {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function richTextToPlainText(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (isRichTextDocument(parsed) || isRichTextNode(parsed)) {
        return richTextToPlainText(parsed);
      }
    } catch {
      if (/<[a-z][\s\S]*>/i.test(trimmed)) return htmlToPlainText(trimmed);
      return trimmed;
    }
    if (/<[a-z][\s\S]*>/i.test(trimmed)) return htmlToPlainText(trimmed);
    return trimmed;
  }

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

export function htmlToPlainText(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, "\n")
      .replace(/<hr\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n"),
  ).trim();
}

export function plainTextToHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

/** Light markdown → HTML for AI answers and pasted study notes. */
export function markdownishToHtml(text: string): string {
  const trimmed = text.replace(/\r\n/g, "\n").trim();
  if (!trimmed) return "";

  const blocks: string[] = [];
  const fenceParts = trimmed.split(/(```[\s\S]*?```)/);

  for (const part of fenceParts) {
    if (!part) continue;
    if (part.startsWith("```")) {
      const code = part.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, "");
      blocks.push(`<pre><code>${escapeHtml(code)}</code></pre>`);
      continue;
    }

    for (const block of part.split(/\n{2,}/)) {
      let lines = block
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);
      if (!lines.length) continue;

      if (/^###\s+/.test(lines[0]!)) {
        blocks.push(
          `<h3>${formatInlineMarkdown(lines[0]!.replace(/^###\s+/, ""))}</h3>`,
        );
        lines = lines.slice(1);
        if (!lines.length) continue;
      } else if (/^##\s+/.test(lines[0]!)) {
        blocks.push(
          `<h2>${formatInlineMarkdown(lines[0]!.replace(/^##\s+/, ""))}</h2>`,
        );
        lines = lines.slice(1);
        if (!lines.length) continue;
      }

      if (lines.every((line) => /^[-*•]\s+/.test(line))) {
        blocks.push(
          `<ul>${lines
            .map((line) => `<li>${formatInlineMarkdown(line.replace(/^[-*•]\s+/, ""))}</li>`)
            .join("")}</ul>`,
        );
        continue;
      }
      if (lines.every((line) => /^\d+[.)]\s+/.test(line))) {
        blocks.push(
          `<ol>${lines
            .map((line) => `<li>${formatInlineMarkdown(line.replace(/^\d+[.)]\s+/, ""))}</li>`)
            .join("")}</ol>`,
        );
        continue;
      }

      blocks.push(
        `<p>${lines.map((line) => formatInlineMarkdown(line)).join("<br />")}</p>`,
      );
    }
  }

  return blocks.join("");
}

function formatInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

/**
 * Normalize any answer/paste payload into Lexical JSON for storage.
 * Accepts Lexical JSON, HTML, markdown-ish, or plain text.
 */
export function ensureLexicalJson(value: unknown): string {
  if (value == null) return JSON.stringify(emptyDoc());

  if (typeof value === "object") {
    return isRichTextDocument(value)
      ? JSON.stringify(value)
      : JSON.stringify(emptyDoc());
  }

  if (typeof value !== "string") return JSON.stringify(emptyDoc());

  const trimmed = value.trim();
  if (!trimmed) return JSON.stringify(emptyDoc());

  const parsed = parseRichTextDocument(trimmed);
  if (parsed) return JSON.stringify(parsed);

  if (/<[a-z][\s\S]*>/i.test(trimmed) && !trimmed.startsWith("{")) {
    return htmlToLexicalJson(trimmed);
  }

  return htmlToLexicalJson(markdownishToHtml(trimmed));
}

export function richTextToHtml(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const document = parseRichTextDocument(trimmed);
    if (document) return lexicalJsonToHtml(trimmed);
    if (/<[a-z][\s\S]*>/i.test(trimmed) && !trimmed.startsWith("{")) {
      return trimmed;
    }
    return plainTextToHtml(trimmed);
  }
  if (isRichTextDocument(value) || isRichTextNode(value)) {
    return lexicalJsonToHtml(JSON.stringify(value));
  }
  return "";
}

export function htmlToLexicalJson(html: string): string {
  if (!html.trim()) return JSON.stringify(emptyDoc());

  if (typeof DOMParser !== "undefined") {
    return htmlDomToLexicalJson(html);
  }

  return htmlFallbackToLexicalJson(html);
}

export function lexicalJsonToHtml(json: string | object): string {
  try {
    const doc = typeof json === "string" ? JSON.parse(json) : json;
    if (!doc?.root?.children) {
      return typeof json === "string" ? json : "";
    }
    return (doc.root.children as LexicalNode[])
      .map((node) => nodeToHtml(node))
      .join("");
  } catch {
    return typeof json === "string" ? json : "";
  }
}

type LexicalNode = {
  type?: string;
  tag?: string;
  text?: string;
  url?: string;
  format?: number | string;
  listType?: string;
  children?: LexicalNode[];
};

function nodeToHtml(node: LexicalNode): string {
  if (node.type === "text" && node.text != null) {
    return applyTextFormat(escapeHtml(node.text), numericFormat(node.format));
  }

  if (node.type === "linebreak") return "<br />";

  const inner = (node.children ?? []).map(nodeToHtml).join("");

  switch (node.type) {
    case "paragraph":
      return `<p>${inner}</p>`;
    case "heading": {
      const tag = node.tag === "h3" ? "h3" : "h2";
      return `<${tag}>${inner}</${tag}>`;
    }
    case "list": {
      const tag = node.listType === "number" ? "ol" : "ul";
      return `<${tag}>${inner}</${tag}>`;
    }
    case "listitem":
      return `<li>${inner}</li>`;
    case "quote":
      return `<blockquote>${inner}</blockquote>`;
    case "code":
      return `<pre><code>${inner}</code></pre>`;
    case "link": {
      const href = safeHref(node.url);
      return href ? `<a href="${escapeHtml(href)}">${inner}</a>` : inner;
    }
    default:
      return inner;
  }
}

function applyTextFormat(text: string, format: number): string {
  let html = text;
  if (format & TEXT_FORMAT.code) html = `<code>${html}</code>`;
  if (format & TEXT_FORMAT.bold) html = `<strong>${html}</strong>`;
  if (format & TEXT_FORMAT.italic) html = `<em>${html}</em>`;
  if (format & TEXT_FORMAT.underline) html = `<u>${html}</u>`;
  if (format & TEXT_FORMAT.strikethrough) html = `<s>${html}</s>`;
  return html;
}

function numericFormat(format: number | string | undefined) {
  return typeof format === "number" ? format : 0;
}

function htmlDomToLexicalJson(html: string): string {
  const parser = new DOMParser();
  const prepared = html.replace(/<hr\s*\/?>/gi, "<p>---</p>");
  const dom = parser.parseFromString(prepared, "text/html");
  const children = Array.from(dom.body.childNodes).flatMap((node) =>
    blockNodesFromDom(node),
  );

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

function blockNodesFromDom(node: ChildNode): Record<string, unknown>[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.replace(/\s+/g, " ").trim();
    if (!text) return [];
    return [paragraphWithInlines([textLeaf(text, 0)])];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return [];
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  if (tag === "ul" || tag === "ol") {
    return [
      {
        type: "list",
        listType: tag === "ol" ? "number" : "bullet",
        tag,
        start: 1,
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: Array.from(el.children)
          .filter((child) => child.tagName.toLowerCase() === "li")
          .map((item) => ({
            type: "listitem",
            value: 1,
            direction: null,
            format: "",
            indent: 0,
            version: 1,
            children: inlineNodesFromDom(item, 0),
          })),
      },
    ];
  }

  if (tag === "h2" || tag === "h3") {
    return [
      {
        type: "heading",
        tag,
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: inlineNodesFromDom(el, 0),
      },
    ];
  }

  if (tag === "blockquote") {
    return [
      {
        type: "quote",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: inlineNodesFromDom(el, 0),
      },
    ];
  }

  if (tag === "pre") {
    return [
      {
        type: "code",
        direction: null,
        format: "",
        indent: 0,
        version: 1,
        children: [textLeaf(el.textContent ?? "", TEXT_FORMAT.code)],
      },
    ];
  }

  if (tag === "div") {
    return Array.from(el.childNodes).flatMap((child) => blockNodesFromDom(child));
  }

  return [paragraphWithInlines(inlineNodesFromDom(el, 0))];
}

function inlineNodesFromDom(
  el: Element,
  inheritedFormat: number,
): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];

  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent ?? "";
      if (text) nodes.push(textLeaf(text, inheritedFormat));
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const childEl = child as HTMLElement;
    const tag = childEl.tagName.toLowerCase();

    if (tag === "br") {
      nodes.push({ type: "linebreak", version: 1 });
      continue;
    }

    if (tag === "a") {
      const href = safeHref(childEl.getAttribute("href"));
      const children = inlineNodesFromDom(childEl, inheritedFormat);
      if (href) {
        nodes.push({
          type: "link",
          url: href,
          rel: "noreferrer",
          target: "_blank",
          title: null,
          direction: null,
          format: "",
          indent: 0,
          version: 1,
          children,
        });
      } else {
        nodes.push(...children);
      }
      continue;
    }

    nodes.push(
      ...inlineNodesFromDom(childEl, inheritedFormat | formatFromTag(tag)),
    );
  }

  return nodes;
}

function formatFromTag(tag: string) {
  if (tag === "strong" || tag === "b") return TEXT_FORMAT.bold;
  if (tag === "em" || tag === "i") return TEXT_FORMAT.italic;
  if (tag === "u") return TEXT_FORMAT.underline;
  if (tag === "s" || tag === "strike" || tag === "del")
    return TEXT_FORMAT.strikethrough;
  if (tag === "code") return TEXT_FORMAT.code;
  return 0;
}

function htmlFallbackToLexicalJson(html: string): string {
  const paragraphs = htmlToPlainText(html)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const children = paragraphs.map((text) => paragraphWithInlines([textLeaf(text, 0)]));

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

function paragraphWithInlines(children: Record<string, unknown>[]) {
  return {
    children: children.length ? children : [],
    direction: null,
    format: "",
    indent: 0,
    textFormat: 0,
    textStyle: "",
    type: "paragraph",
    version: 1,
  };
}

function textLeaf(text: string, format: number) {
  return {
    detail: 0,
    format,
    mode: "normal",
    style: "",
    text,
    type: "text",
    version: 1,
  };
}

function safeHref(url: string | null | undefined) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || /^mailto:/i.test(url)) return url;
  return null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeEntities(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
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
