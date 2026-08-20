const EMAIL_ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "a",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "blockquote",
  "hr",
  "span",
  "div",
  "code",
  "pre",
]);

const EMAIL_ALLOWED_ATTR: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
};

export function sanitizeEmailHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, "text/html");
    sanitizeNode(doc.body);
    return doc.body.innerHTML.trim();
  }

  return trimmed
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
}

function sanitizeNode(node: Node) {
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (tag === "script" || tag === "style" || tag === "iframe" || tag === "object") {
        el.remove();
        continue;
      }
      if (!EMAIL_ALLOWED_TAGS.has(tag)) {
        const parent = el.parentNode;
        while (el.firstChild) parent?.insertBefore(el.firstChild, el);
        parent?.removeChild(el);
        continue;
      }

      for (const attr of Array.from(el.attributes)) {
        const allowed = EMAIL_ALLOWED_ATTR[tag];
        if (!allowed?.has(attr.name.toLowerCase())) {
          el.removeAttribute(attr.name);
          continue;
        }
        if (attr.name.toLowerCase() === "href" && !isSafeHref(attr.value)) {
          el.removeAttribute(attr.name);
        }
      }

      if (tag === "a") {
        el.setAttribute("rel", "noreferrer");
      }

      sanitizeNode(el);
    } else if (child.nodeType !== Node.TEXT_NODE) {
      child.parentNode?.removeChild(child);
    }
  }
}

function isSafeHref(url: string) {
  return /^(https?:|mailto:)/i.test(url.trim());
}
