import type { ReactNode } from "react";

type RichNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  marks?: Array<{ type?: string }>;
};

function isRichNode(value: unknown): value is RichNode {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function RichTextDocument({ document }: { document: unknown }) {
  if (!isRichNode(document)) return null;

  return (
    <div className="rich-document">
      {document.content?.map((node, index) => renderNode(node, index))}
    </div>
  );
}

function renderNode(node: RichNode, key: number): ReactNode {
  const children = node.content?.map((child, index) =>
    renderNode(child, index),
  );

  switch (node.type) {
    case "text":
      return renderText(node, key);
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const level =
        typeof node.attrs?.level === "number" ? node.attrs.level : 2;
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
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{getPlainText(node)}</code>
        </pre>
      );
    case "hardBreak":
      return <br key={key} />;
    default:
      return <span key={key}>{children}</span>;
  }
}

function renderText(node: RichNode, key: number) {
  let content: ReactNode = node.text ?? "";

  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") content = <strong>{content}</strong>;
    if (mark.type === "italic") content = <em>{content}</em>;
    if (mark.type === "code") content = <code>{content}</code>;
  }

  return <span key={key}>{content}</span>;
}

function getPlainText(node: RichNode): string {
  if (node.text) return node.text;
  return node.content?.map(getPlainText).join("") ?? "";
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

  return (document.content ?? []).flatMap((node, index) => {
    if (node.type !== "heading") return [];
    return [
      {
        id: headingId(node, index),
        label: getPlainText(node),
        level: typeof node.attrs?.level === "number" ? node.attrs.level : 2,
      },
    ];
  });
}
