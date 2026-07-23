import { describe, it, expect } from "vitest";
import { nextDailyStreak } from "./statsService.js";

describe("nextDailyStreak", () => {
  it("démarre une série à 1 quand il n'y a aucune date précédente", () => {
    expect(nextDailyStreak(0, null, "2026-07-22")).toBe(1);
  });

  it("ne change rien si une partie a déjà été jouée aujourd'hui", () => {
    expect(nextDailyStreak(5, "2026-07-22", "2026-07-22")).toBe(5);
  });

  it("incrémente la série si la dernière partie était hier", () => {
    expect(nextDailyStreak(5, "2026-07-21", "2026-07-22")).toBe(6);
  });

  it("incrémente correctement à travers un changement de mois", () => {
    expect(nextDailyStreak(3, "2026-06-30", "2026-07-01")).toBe(4);
  });

  it("réinitialise la série à 1 si un jour a été manqué", () => {
    expect(nextDailyStreak(10, "2026-07-19", "2026-07-22")).toBe(1);
  });
});
