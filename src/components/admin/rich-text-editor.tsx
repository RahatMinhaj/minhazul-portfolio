"use client";

import { $createCodeNode, CodeNode } from "@lexical/code";
import { LinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  type TextFormatType,
} from "lexical";
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { htmlToLexicalJson, lexicalJsonToHtml } from "@/lib/content/rich-text";

export type RichTextEditorVariant = "document" | "email";

const emptyDocument = {
  root: {
    children: [
      {
        children: [],
        direction: null,
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
        type: "paragraph",
        version: 1,
      },
    ],
    direction: null,
    format: "",
    indent: 0,
    type: "root",
    version: 1,
  },
};

const editorTheme = {
  code: "rich-editor-code",
  heading: {
    h2: "rich-editor-heading rich-editor-heading-h2",
    h3: "rich-editor-heading rich-editor-heading-h3",
  },
  link: "rich-editor-link",
  list: {
    listitem: "rich-editor-list-item",
    nested: { listitem: "rich-editor-nested-list-item" },
    ol: "rich-editor-list rich-editor-list-ordered",
    ul: "rich-editor-list rich-editor-list-unordered",
  },
  paragraph: "rich-editor-paragraph",
  quote: "rich-editor-quote",
  text: {
    bold: "font-semibold text-[var(--foreground)]",
    code: "rich-editor-inline-code",
    italic: "italic",
    strikethrough: "line-through",
    underline: "underline underline-offset-2",
  },
};

export function RichTextEditor({
  contentKey,
  initialContent,
  label = "Rich text content",
  name = "content",
  onChange,
  onHtmlChange,
  variant = "document",
}: {
  contentKey?: string | number;
  initialContent?: unknown;
  label?: string;
  name?: string;
  onChange?: (value: string) => void;
  onHtmlChange?: (html: string) => void;
  variant?: RichTextEditorVariant;
}) {
  const normalized = normalizeContent(initialContent);
  const [editorKey, setEditorKey] = useState(contentKey);
  const [serialized, setSerialized] = useState(normalized.editorState);

  if (editorKey !== contentKey) {
    setEditorKey(contentKey);
    setSerialized(normalized.editorState);
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)]">
      <LexicalComposer
        key={`${name}-${contentKey ?? "init"}`}
        initialConfig={{
          editorState: normalized.editorState,
          namespace: `admin-rich-text-${name}-${contentKey ?? "init"}`,
          nodes: [
            CodeNode,
            HeadingNode,
            LinkNode,
            ListItemNode,
            ListNode,
            QuoteNode,
          ],
          onError(error) {
            throw error;
          },
          theme: editorTheme,
        }}
      >
        <EditorToolbar variant={variant} />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label={label}
                className="rich-editor-content min-h-64 px-4 py-4 text-sm leading-7 outline-none"
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
            placeholder={
              <p className="pointer-events-none absolute top-4 left-4 text-sm text-[var(--muted)] opacity-65">
                Start writing...
              </p>
            }
          />
          <HistoryPlugin />
          <LinkPlugin validateUrl={(url) => isSafeUrl(url, variant)} />
          <ListPlugin />
          <TabIndentationPlugin />
          <OnChangePlugin
            ignoreSelectionChange
            onChange={(editorState) => {
              const json = JSON.stringify(editorState.toJSON());
              setSerialized(json);
              onChange?.(json);
              onHtmlChange?.(lexicalJsonToHtml(json));
            }}
          />
        </div>
      </LexicalComposer>
      <input name={name} type="hidden" value={serialized} />
    </div>
  );
}

function EditorToolbar({ variant }: { variant: RichTextEditorVariant }) {
  const [editor] = useLexicalComposerContext();
  const [active, setActive] = useState({
    block: "paragraph",
    bold: false,
    code: false,
    italic: false,
    strikethrough: false,
    underline: false,
  });
  const email = variant === "email";

  useEffect(
    () =>
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) return;

          const anchor = selection.anchor.getNode();
          const element =
            anchor.getKey() === "root"
              ? anchor
              : anchor.getTopLevelElementOrThrow();
          let block = element.getType();
          if ($isHeadingNode(element)) block = element.getTag();
          if (element instanceof ListNode) block = element.getListType();

          setActive({
            block,
            bold: selection.hasFormat("bold"),
            code: selection.hasFormat("code"),
            italic: selection.hasFormat("italic"),
            strikethrough: selection.hasFormat("strikethrough"),
            underline: selection.hasFormat("underline"),
          });
        });
      }),
    [editor],
  );

  function formatText(format: TextFormatType) {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  }

  function formatBlock(type: "code" | "h2" | "h3" | "quote") {
    editor.update(() => {
      const selection = $getSelection();
      if (active.block === type) {
        $setBlocksType(selection, () => $createParagraphNode());
      } else if (type === "h2" || type === "h3") {
        $setBlocksType(selection, () => $createHeadingNode(type));
      } else if (type === "quote") {
        $setBlocksType(selection, () => $createQuoteNode());
      } else {
        $setBlocksType(selection, () => $createCodeNode());
      }
    });
  }

  function toggleList(type: "bullet" | "number") {
    if (active.block === type) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      return;
    }
    editor.dispatchCommand(
      type === "bullet"
        ? INSERT_UNORDERED_LIST_COMMAND
        : INSERT_ORDERED_LIST_COMMAND,
      undefined,
    );
  }

  return (
    <div
      aria-label="Formatting controls"
      className="flex flex-wrap gap-1 border-b border-[var(--border)] bg-[var(--surface-raised)]/50 p-2"
      role="toolbar"
    >
      <ToolbarButton
        label="Undo"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <Undo2 aria-hidden size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <Redo2 aria-hidden size={15} />
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        active={active.bold}
        label="Bold"
        onClick={() => formatText("bold")}
      >
        <Bold aria-hidden size={15} />
      </ToolbarButton>
      <ToolbarButton
        active={active.italic}
        label="Italic"
        onClick={() => formatText("italic")}
      >
        <Italic aria-hidden size={15} />
      </ToolbarButton>
      <ToolbarButton
        active={active.underline}
        label="Underline"
        onClick={() => formatText("underline")}
      >
        <Underline aria-hidden size={15} />
      </ToolbarButton>
      <ToolbarButton
        active={active.strikethrough}
        label="Strikethrough"
        onClick={() => formatText("strikethrough")}
      >
        <Strikethrough aria-hidden size={15} />
      </ToolbarButton>
      <ToolbarDivider />
      {email ? null : (
        <>
          <ToolbarButton
            active={active.block === "h2"}
            label="Heading"
            onClick={() => formatBlock("h2")}
          >
            <Heading2 aria-hidden size={15} />
          </ToolbarButton>
          <ToolbarButton
            active={active.block === "h3"}
            label="Subheading"
            onClick={() => formatBlock("h3")}
          >
            <Heading3 aria-hidden size={15} />
          </ToolbarButton>
        </>
      )}
      <ToolbarButton
        active={active.block === "bullet"}
        label="Bullet list"
        onClick={() => toggleList("bullet")}
      >
        <List aria-hidden size={15} />
      </ToolbarButton>
      <ToolbarButton
        active={active.block === "number"}
        label="Numbered list"
        onClick={() => toggleList("number")}
      >
        <ListOrdered aria-hidden size={15} />
      </ToolbarButton>
      {email ? null : (
        <>
          <ToolbarButton
            active={active.block === "quote"}
            label="Quote"
            onClick={() => formatBlock("quote")}
          >
            <Quote aria-hidden size={15} />
          </ToolbarButton>
          <ToolbarButton
            active={active.block === "code" || active.code}
            label="Code"
            onClick={() => formatBlock("code")}
          >
            <Code2 aria-hidden size={15} />
          </ToolbarButton>
        </>
      )}
      <ToolbarDivider />
      <ToolbarButton
        label="Add link"
        onClick={() => {
          const url = window.prompt(
            "Link URL",
            email ? "mailto:" : "https://",
          );
          if (url?.trim() && isSafeUrl(url.trim(), variant)) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim());
          }
        }}
      >
        <Link2 aria-hidden size={15} />
      </ToolbarButton>
      <ToolbarButton
        label="Remove link"
        onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}
      >
        <Link2Off aria-hidden size={15} />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  active,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => unknown;
}) {
  return (
    <Button
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      size="icon"
      type="button"
      variant={active ? "outline" : "ghost"}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden className="mx-1 w-px bg-[var(--border)]" />;
}

function normalizeContent(content: unknown): { editorState: string } {
  if (isLexicalDocument(content)) {
    return { editorState: JSON.stringify(content) };
  }

  if (typeof content === "string" && content.trim()) {
    try {
      const parsed = JSON.parse(content);
      if (isLexicalDocument(parsed)) {
        return { editorState: JSON.stringify(parsed) };
      }
    } catch {
      // Not JSON — fall through
    }
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return { editorState: htmlToLexicalJson(content) };
    }
    return {
      editorState: JSON.stringify({
        root: {
          ...emptyDocument.root,
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: content,
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
            },
          ],
        },
      }),
    };
  }

  return { editorState: JSON.stringify(emptyDocument) };
}

function isLexicalDocument(
  value: unknown,
): value is Record<string, unknown> & { root: Record<string, unknown> } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const root = (value as Record<string, unknown>).root;
  if (!root || typeof root !== "object" || Array.isArray(root)) return false;
  return (root as Record<string, unknown>).type === "root";
}

function isSafeUrl(url: string, variant: RichTextEditorVariant = "document") {
  if (/^https?:\/\//i.test(url)) return true;
  return variant === "email" && /^mailto:/i.test(url);
}
