import { describe, it, expect, beforeEach } from "vitest";
import {
  isLang,
  isRtl,
  getStoredLang,
  getActiveLang,
  applyLangDir,
  setLang,
  DEFAULT_LANG,
} from "./lang";

describe("isLang", () => {
  it("accepts the supported languages and rejects anything else", () => {
    expect(isLang("fr")).toBe(true);
    expect(isLang("ar")).toBe(true);
    expect(isLang("en")).toBe(true);
    expect(isLang("es")).toBe(false);
    expect(isLang(null)).toBe(false);
    expect(isLang(42)).toBe(false);
  });
});

describe("isRtl", () => {
  it("is true only for Arabic", () => {
    expect(isRtl("ar")).toBe(true);
    expect(isRtl("fr")).toBe(false);
    expect(isRtl("en")).toBe(false);
  });
});

describe("stored / active language", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("lang");
  });

  it("returns null when nothing is stored", () => {
    expect(getStoredLang()).toBeNull();
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem("sougapp-lang", "es");
    expect(getStoredLang()).toBeNull();
  });

  it("falls back to the default language when unset", () => {
    expect(getActiveLang()).toBe(DEFAULT_LANG);
  });

  it("prefers the explicit stored choice", () => {
    setLang("ar");
    expect(getStoredLang()).toBe("ar");
    expect(getActiveLang()).toBe("ar");
  });
});

describe("applyLangDir", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("dir");
    document.documentElement.removeAttribute("lang");
  });

  it("sets dir=rtl and lang=ar for Arabic", () => {
    applyLangDir("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
  });

  it("sets dir=ltr for a left-to-right language", () => {
    applyLangDir("fr");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("fr");
  });
});

describe("setLang", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("dir");
  });

  it("persists the choice and applies the direction to the document", () => {
    setLang("ar");
    expect(localStorage.getItem("sougapp-lang")).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });
});
