import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardContent } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p data-testid="child">Hello</p></Card>);
    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("applies className", () => {
    const { container } = render(<Card className="custom" />);
    expect(container.firstChild).toHaveClass("custom");
  });
});

describe("CardHeader", () => {
  it("renders title and subtitle", () => {
    render(<CardHeader title="My Title" subtitle="My Subtitle" />);
    expect(screen.getByText("My Title")).toBeInTheDocument();
    expect(screen.getByText("My Subtitle")).toBeInTheDocument();
  });
});

describe("CardContent", () => {
  it("renders children", () => {
    render(<CardContent><span>Content</span></CardContent>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
