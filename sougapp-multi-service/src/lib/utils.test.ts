import { describe, it, expect } from "vitest";
import { cn, formatNumber, formatMRU, formatDelta } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });
});

describe("formatNumber", () => {
  it("formats with French locale", () => {
    expect(formatNumber(1234, "fr")).toBe("1\u202f234");
  });
});

describe("formatMRU", () => {
  it("formats MRU currency", () => {
    const result = formatMRU(1500, "fr");
    expect(result).toContain("1");
    expect(result).toContain("500");
  });

  it("supports compact mode", () => {
    const result = formatMRU(2500000, "fr", { compact: true });
    expect(result).toContain("M");
  });
});

describe("formatDelta", () => {
  it("formats positive delta", () => {
    const result = formatDelta(12.5);
    expect(result).toContain("12");
    expect(result).toContain("5");
    expect(result.startsWith("+")).toBe(true);
  });

  it("formats negative delta", () => {
    const result = formatDelta(-3.2);
    expect(result).toContain("3");
    expect(result).toContain("2");
    expect(result.startsWith("-")).toBe(true);
  });
});
