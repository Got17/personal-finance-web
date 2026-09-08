import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CardActions } from "./CardActions";

describe("CardActions", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders null if no handlers are provided", () => {
    const { container } = render(<CardActions />);
    expect(container.firstChild).toBeNull();
  });

  it("renders edit and deactivate buttons when handlers are provided", () => {
    const onEdit = vi.fn();
    const onDeactivate = vi.fn();

    render(
      <CardActions
        onEdit={onEdit}
        onDeactivate={onDeactivate}
        editAriaLabel="Edit checking"
        deactivateAriaLabel="Deactivate checking"
      />,
    );

    const editBtn = screen.getByRole("button", { name: "Edit checking" });
    const deactivateBtn = screen.getByRole("button", { name: "Deactivate checking" });

    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(deactivateBtn);
    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });

  it("hides deactivate button when canDeactivate is false", () => {
    const onEdit = vi.fn();
    const onDeactivate = vi.fn();

    render(
      <CardActions
        onEdit={onEdit}
        onDeactivate={onDeactivate}
        canDeactivate={false}
      />,
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Deactivate" })).toBeNull();
  });
});
