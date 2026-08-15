import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import { AdminMutationForm } from "@/components/admin/admin-mutation-form";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("AdminMutationForm", () => {
  it("preserves every submitted control when the action reports an error", async () => {
    const user = userEvent.setup();
    const action = vi.fn(async () => ({
      status: "error" as const,
      message: "Validation failed.",
      version: 1,
    }));

    render(
      <AdminMutationForm action={action} submitLabel="Create">
        <input aria-label="Title" defaultValue="" name="title" />
        <textarea aria-label="Description" name="description" />
        <select aria-label="Status" defaultValue="DRAFT" name="status">
          <option value="DRAFT">Draft</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <input aria-label="Featured" name="featured" type="checkbox" />
      </AdminMutationForm>,
    );

    await user.type(screen.getByLabelText("Title"), "Portfolio API");
    await user.type(
      screen.getByLabelText("Description"),
      "A complete project description",
    );
    await user.selectOptions(screen.getByLabelText("Status"), "COMPLETED");
    await user.click(screen.getByLabelText("Featured"));
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(action).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Validation failed."),
    );
    expect(screen.getByRole("button", { name: "Create" })).toBeEnabled();
    expect(screen.getByLabelText("Title")).toHaveValue("Portfolio API");
    expect(screen.getByLabelText("Description")).toHaveValue(
      "A complete project description",
    );
    expect(screen.getByLabelText("Status")).toHaveValue("COMPLETED");
    expect(screen.getByLabelText("Featured")).toBeChecked();
  });

  it("does not submit a mutation when confirmation is declined", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValueOnce(false);

    render(
      <AdminMutationForm action={action} confirmMessage="Delete permanently?">
        <input name="id" value="record-id" readOnly />
      </AdminMutationForm>,
    );

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(window.confirm).toHaveBeenCalledWith("Delete permanently?");
    expect(action).not.toHaveBeenCalled();
  });
});
