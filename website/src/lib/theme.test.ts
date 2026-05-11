import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  derivePalette,
  deriveSecondaryPalette,
  wcagLevel,
} from "./theme";

describe("derivePalette", () => {
  it("returns the input hex as base (normalized lowercase)", () => {
    const p = derivePalette("#0A84FF");
    expect(p.base).toBe("#0a84ff");
  });

  it("falls back to the default when given garbage", () => {
    const p = derivePalette("not-a-color");
    expect(p.base).toBe("#0a84ff"); // fallback
  });

  it("produces darker base than l50/l100 (perceptually)", () => {
    // We compare via WCAG contrast against white: darker = higher contrast.
    const p = derivePalette("#e8551c");
    const baseContrast = contrastRatio(p.base, "#ffffff");
    const l50Contrast = contrastRatio(p.l50, "#ffffff");
    const l100Contrast = contrastRatio(p.l100, "#ffffff");
    expect(baseContrast).toBeGreaterThan(l100Contrast);
    expect(l100Contrast).toBeGreaterThan(l50Contrast);
  });

  it("returns 4 distinct shades for a typical brand color", () => {
    const p = derivePalette("#e8551c");
    const set = new Set([p.base, p.dark, p.l50, p.l100]);
    expect(set.size).toBe(4);
  });
});

describe("deriveSecondaryPalette", () => {
  it("returns base + l50", () => {
    const p = deriveSecondaryPalette("#0f766e");
    expect(p.base).toBe("#0f766e");
    expect(p.l50).not.toBe(p.base);
  });
});

describe("contrastRatio", () => {
  it("identical colors → ratio 1", () => {
    expect(contrastRatio("#ff0000", "#ff0000")).toBeCloseTo(1, 1);
  });

  it("white on black → ratio 21", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 0);
  });

  it("white on iOS blue is below AA (illustrating why warning matters)", () => {
    // #0a84ff on white is ~3.7:1 — fails AA for normal text, passes AA-large.
    const r = contrastRatio("#0a84ff", "#ffffff");
    expect(r).toBeGreaterThan(3);
    expect(r).toBeLessThan(4.5);
  });

  it("returns 1 for invalid input rather than throwing", () => {
    expect(contrastRatio("garbage", "#fff")).toBe(1);
  });
});

describe("wcagLevel", () => {
  it("classifies thresholds correctly", () => {
    expect(wcagLevel(7.5)).toBe("AAA");
    expect(wcagLevel(7)).toBe("AAA");
    expect(wcagLevel(5)).toBe("AA");
    expect(wcagLevel(4.5)).toBe("AA");
    expect(wcagLevel(3.5)).toBe("AA-large");
    expect(wcagLevel(3)).toBe("AA-large");
    expect(wcagLevel(2)).toBe("fail");
    expect(wcagLevel(1)).toBe("fail");
  });
});
