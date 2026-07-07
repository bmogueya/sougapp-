import { describe, it, expect } from "vitest";
import {
  getOrderStatusMeta,
  ORDER_STATUS_KEYS,
  ORDER_STATUS_TONE_CLASS,
} from "./orderStatus";

describe("getOrderStatusMeta", () => {
  it("returns a French label + tone for every canonical status", () => {
    for (const key of ORDER_STATUS_KEYS) {
      const meta = getOrderStatusMeta(key);
      expect(meta.label.length).toBeGreaterThan(0);
      expect(ORDER_STATUS_TONE_CLASS[meta.tone]).toBeTruthy();
    }
  });

  it("maps the operational flow to sensible tones", () => {
    expect(getOrderStatusMeta("pending").tone).toBe("warning");
    expect(getOrderStatusMeta("ready_for_delivery").tone).toBe("info");
    expect(getOrderStatusMeta("delivered").tone).toBe("success");
    expect(getOrderStatusMeta("cancelled").tone).toBe("danger");
  });

  it("treats the legacy admin vocabulary as first-class (no raw leak)", () => {
    // These were previously unreachable branches in Orders.tsx
    expect(getOrderStatusMeta("accepted").label).toBe("Acceptée");
    expect(getOrderStatusMeta("completed").label).toBe("Terminée");
  });

  it("falls back gracefully for unknown / empty status", () => {
    expect(getOrderStatusMeta("wat").label).toBe("Inconnu");
    expect(getOrderStatusMeta("wat").tone).toBe("muted");
    expect(getOrderStatusMeta(null).label).toBe("Inconnu");
    expect(getOrderStatusMeta(undefined).label).toBe("Inconnu");
  });
});

describe("ORDER_STATUS_TONE_CLASS", () => {
  it("uses theme tokens (bg-*/text-*), never raw slate/gray", () => {
    for (const cls of Object.values(ORDER_STATUS_TONE_CLASS)) {
      expect(cls).not.toMatch(/slate|gray/);
      expect(cls).toMatch(/text-/);
    }
  });
});
