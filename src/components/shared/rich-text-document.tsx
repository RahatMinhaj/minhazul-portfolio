import type { ReactNode } from "react";

type RichNode = {
  type?: string;
  tag?: string;
  text?: string;
  url?: string;
  format?: number | string;
  listType?: string;
  start?: number;
  attrs?: Record<string, unknown>;
  children?: RichNode[];
  content?: RichNode[];
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>;
  root?: RichNode;
};

function isRichNode(value: unknown): value is RichNode {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function RichTextDocument({ document }: { document: unknown }) {
  if (!isRichNode(document)) return null;
  const root = isRichNode(document.root) ? document.root : document;

  return (
    <div className="rich-document">
      {nodeChildren(root).map((node, index) => renderNode(node, index))}
    </div>
  );
}

function renderNode(node: RichNode, key: number): ReactNode {
  const children = nodeChildren(node).map((child, index) =>
    renderNode(child, index),
  );

  switch (node.type) {
    case "text":
      return renderText(node, key);
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const level = headingLevel(node);
      const id = headingId(node, key);
      if (level === 3)
        return (
          <h3 id={id} key={key}>
            {children}
          </h3>
        );
      if (level === 4)
        return (
          <h4 id={id} key={key}>
            {children}
          </h4>
        );
      return (
        <h2 id={id} key={key}>
          {children}
        </h2>
      );
    }
    case "list":
      return node.listType === "number" ? (
        <ol key={key} start={node.start ?? 1}>
          {children}
        </ol>
      ) : (
        <ul key={key}>{children}</ul>
      );
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listitem":
    case "listItem":
      return <li key={key}>{children}</li>;
    case "quote":
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "code":
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{getPlainText(node)}</code>
        </pre>
      );
    case "link": {
      const href = safeLink(node.url);
      return href ? (
        <a href={href} key={key} rel="noreferrer" target="_blank">
          {children}
        </a>
      ) : (
        <span key={key}>{children}</span>
      );
    }
    case "linebreak":
    case "hardBreak":
      return <br key={key} />;
    default:
      return <span key={key}>{children}</span>;
  }
}

function renderText(node: RichNode, key: number) {
  let content: ReactNode = node.text ?? "";
  const format = typeof node.format === "number" ? node.format : 0;

  if (format & 1) content = <strong>{content}</strong>;
  if (format & 2) content = <em>{content}</em>;
  if (format & 4) content = <s>{content}</s>;
  if (format & 8) content = <u>{content}</u>;
  if (format & 16) content = <code>{content}</code>;

  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") content = <strong>{content}</strong>;
    if (mark.type === "italic") content = <em>{content}</em>;
    if (mark.type === "strike") content = <s>{content}</s>;
    if (mark.type === "code") content = <code>{content}</code>;
    if (mark.type === "link") {
      const href = safeLink(mark.attrs?.href);
      if (href) {
        content = (
          <a href={href} rel="noreferrer" target="_blank">
            {content}
          </a>
        );
      }
    }
  }

  return <span key={key}>{content}</span>;
}

function nodeChildren(node: RichNode) {
  return node.children ?? node.content ?? [];
}

function safeLink(value: unknown) {
  if (typeof value !== "string") return null;
  return /^https?:\/\//i.test(value) ? value : null;
}

function getPlainText(node: RichNode): string {
  if (node.text) return node.text;
  return nodeChildren(node).map(getPlainText).join("");
}

function headingLevel(node: RichNode) {
  if (node.tag === "h3" || node.tag === "h4") return Number(node.tag.slice(1));
  return typeof node.attrs?.level === "number" ? node.attrs.level : 2;
}

function headingId(node: RichNode, index: number) {
  const base = getPlainText(node)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "section"}-${index}`;
}

export function getRichTextHeadings(document: unknown) {
  if (!isRichNode(document)) return [];
  const root = isRichNode(document.root) ? document.root : document;

  return nodeChildren(root).flatMap((node, index) => {
    if (node.type !== "heading") return [];
    return [
      {
        id: headingId(node, index),
        label: getPlainText(node),
        level: headingLevel(node),
      },
    ];
  });
}
