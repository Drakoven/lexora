import { describe, it, expect } from "vitest";
import { hashStringToInt } from "./dailyChallengeService.js";

describe("hashStringToInt", () => {
  it("est déterministe pour une même chaîne", () => {
    expect(hashStringToInt("2026-07-23")).toBe(hashStringToInt("2026-07-23"));
  });

  it("donne des résultats différents pour des dates différentes", () => {
    expect(hashStringToInt("2026-07-23")).not.toBe(hashStringToInt("2026-07-24"));
  });

  it("retourne toujours un entier positif", () => {
    for (const date of ["2026-01-01", "2026-12-31", "2026-07-23"]) {
      expect(hashStringToInt(date)).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(hashStringToInt(date))).toBe(true);
    }
  });
});
