import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { RichTextEditor } from "@/components/admin/rich-text-editor";

describe("RichTextEditor", () => {
  it("converts the current paragraph to a bullet list", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RichTextEditor label="Description" name="description" />,
    );
    const editor = screen.getByRole("textbox", { name: "Description" });

    await user.click(editor);
    await user.type(editor, "First item");
    await user.click(screen.getByRole("button", { name: "Bullet list" }));

    await waitFor(() => {
      const value = container.querySelector<HTMLInputElement>(
        'input[name="description"]',
      )?.value;
      const document = JSON.parse(value ?? "null") as {
        root?: {
          children?: Array<{
            children?: unknown[];
            listType?: string;
            type?: string;
          }>;
        };
      };
      expect(document.root?.children?.[0]).toMatchObject({
        type: "list",
        listType: "bullet",
      });
      expect(document.root?.children?.[0]?.children).toHaveLength(1);
    });
  });

  it("resets document content when contentKey changes", async () => {
    const { container, rerender } = render(
      <RichTextEditor
        contentKey="one"
        initialContent="<p>First version</p>"
        label="Description"
        name="description"
      />,
    );

    await waitFor(() => {
      const value = container.querySelector<HTMLInputElement>(
        'input[name="description"]',
      )?.value;
      expect(value).toContain("First version");
    });

    rerender(
      <RichTextEditor
        contentKey="two"
        initialContent="<p>Second version</p>"
        label="Description"
        name="description"
      />,
    );

    await waitFor(() => {
      const value = container.querySelector<HTMLInputElement>(
        'input[name="description"]',
      )?.value;
      expect(value).toContain("Second version");
      expect(value).not.toContain("First version");
    });
  });
});
