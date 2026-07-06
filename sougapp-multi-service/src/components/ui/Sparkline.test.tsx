import { render } from "@testing-library/react";
import { Sparkline } from "./Sparkline";

describe("Sparkline", () => {
  it("renders an SVG", () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders with flat data", () => {
    const { container } = render(<Sparkline data={[5, 5, 5]} />);
    expect(container.querySelector("polyline")).toBeInTheDocument();
  });

  it("renders with single data point", () => {
    const { container } = render(<Sparkline data={[42]} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("accepts custom height and color", () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} height={60} color="red" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("style")).toContain("height: 60");
  });
});
