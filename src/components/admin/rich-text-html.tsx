import { richTextToHtml } from "@/lib/content/rich-text";
import { cn } from "@/lib/utils/cn";

/** Renders stored Lexical JSON / HTML / plain text for admin previews. */
export function RichTextHtml({
  className,
  content,
}: {
  className?: string;
  content: unknown;
}) {
  const html = richTextToHtml(content);
  if (!html) return null;

  return (
    <div
      className={cn("rich-editor-content text-sm leading-7", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
