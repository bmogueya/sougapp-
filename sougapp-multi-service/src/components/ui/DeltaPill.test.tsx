import { render } from "@testing-library/react";
import { DeltaPill } from "./DeltaPill";

describe("DeltaPill", () => {
  it("renders positive delta with arrow up", () => {
    const { container } = render(<DeltaPill value={12.5} />);
    const text = container.textContent ?? "";
    expect(text).toContain("12");
    expect(text).toContain("5");
    expect(container.querySelector(".lucide-trending-up")).toBeInTheDocument();
  });

  it("renders negative delta with arrow down", () => {
    const { container } = render(<DeltaPill value={-3.2} />);
    const text = container.textContent ?? "";
    expect(text).toContain("3");
    expect(text).toContain("2");
    expect(container.querySelector(".lucide-trending-down")).toBeInTheDocument();
  });

  it("renders zero as flat", () => {
    const { container } = render(<DeltaPill value={0} />);
    expect(container.textContent).toContain("0");
  });
});
