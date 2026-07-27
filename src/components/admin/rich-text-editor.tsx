"use client";

import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code2,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const emptyDocument = { type: "doc", content: [{ type: "paragraph" }] };

export function RichTextEditor({
  initialContent,
  name = "content",
}: {
  initialContent?: unknown;
  name?: string;
}) {
  const [serialized, setSerialized] = useState(() =>
    JSON.stringify(initialContent ?? emptyDocument),
  );
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        autolink: false,
        openOnClick: false,
        protocols: ["http", "https"],
      }),
    ],
    content: initialContent ?? emptyDocument,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "rich-editor-content min-h-64 px-4 py-3 outline-none text-sm leading-7",
        "aria-label": "Rich text content",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setSerialized(JSON.stringify(currentEditor.getJSON()));
    },
  });

  return (
    <div className="overflow-hidden rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface)]">
      <div
        aria-label="Formatting controls"
        className="flex flex-wrap gap-1 border-b border-[var(--border)] p-2"
        role="toolbar"
      >
        <ToolbarButton
          active={editor?.isActive("bold")}
          label="Bold"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold aria-hidden size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("italic")}
          label="Italic"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic aria-hidden size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("heading", { level: 2 })}
          label="Heading"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 aria-hidden size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("bulletList")}
          label="Bullet list"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List aria-hidden size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("orderedList")}
          label="Numbered list"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered aria-hidden size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("blockquote")}
          label="Quote"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote aria-hidden size={15} />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("codeBlock")}
          label="Code block"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 aria-hidden size={15} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <input name={name} type="hidden" value={serialized} />
    </div>
  );
}

function ToolbarButton({
  active,
  children,
  label,
  onClick,
}: {
  active?: boolean | undefined;
  children: React.ReactNode;
  label: string;
  onClick: () => boolean | undefined;
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
