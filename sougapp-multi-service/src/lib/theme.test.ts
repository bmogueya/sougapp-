import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTheme, getStoredTheme, getActiveTheme, setTheme, applyTheme } from "./theme";

describe("nextTheme", () => {
  it("flips between light and dark", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
  });
});

describe("stored / active theme", () => {
  // jsdom n'implémente pas matchMedia : on le stubbe (par défaut : clair).
  const stubMatchMedia = (matches: boolean) => {
    window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
  };

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    stubMatchMedia(false);
  });

  it("returns null when nothing is stored", () => {
    expect(getStoredTheme()).toBeNull();
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem("sougapp-theme", "purple");
    expect(getStoredTheme()).toBeNull();
  });

  it("falls back to the system preference when unset", () => {
    stubMatchMedia(true);
    expect(getActiveTheme()).toBe("dark");
  });

  it("prefers the explicit stored choice over the system", () => {
    stubMatchMedia(true);
    setTheme("light");
    expect(getStoredTheme()).toBe("light");
    expect(getActiveTheme()).toBe("light");
  });
});

describe("applyTheme", () => {
  beforeEach(() => document.documentElement.classList.remove("dark"));

  it("adds .dark on <html> for dark and removes it for light", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
