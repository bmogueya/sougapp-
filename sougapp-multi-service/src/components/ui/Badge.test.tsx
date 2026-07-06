import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders dot when dot prop is true", () => {
    const { container } = render(<Badge dot />);
    expect(container.firstChild?.firstChild).toHaveClass("rounded-full");
  });
});
