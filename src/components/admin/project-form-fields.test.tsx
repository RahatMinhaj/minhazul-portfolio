import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectFormFields } from "@/components/admin/project-form-fields";
import { projectFormFieldNames } from "@/lib/validation/admin-project";

describe("ProjectFormFields", () => {
  it("renders every field accepted by project validation", () => {
    const { container } = render(<ProjectFormFields />);
    const names = Array.from(
      container.querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >("input[name], select[name], textarea[name]"),
      (field) => field.name,
    );

    expect(names).toEqual(projectFormFieldNames);
    expect(screen.getByLabelText("Title")).toBeRequired();
    expect(screen.getByLabelText("Slug")).toHaveAttribute(
      "pattern",
      "[a-z0-9]+(?:-[a-z0-9]+)*",
    );
    expect(screen.getByLabelText("Short description")).toBeRequired();
    expect(screen.getByLabelText("Project type / tag")).toBeInTheDocument();
    expect(screen.getByLabelText("Client / sector")).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Featured (shown first)"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toHaveValue("DRAFT");
    expect(screen.getByLabelText("Sort order")).toHaveValue(0);
    expect(screen.getByLabelText("Visible")).toBeChecked();
  });
});
