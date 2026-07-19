import { describe, it, expect } from "vitest";
import { computeEloUpdate } from "../game/elo.js";

describe("computeEloUpdate", () => {
  it("entre deux joueurs de même niveau, le gagnant prend exactement ce que perd le perdant", () => {
    const { ratingA, ratingB } = computeEloUpdate(1000, 1000, 1);
    expect(ratingA).toBe(1016);
    expect(ratingB).toBe(984);
    expect(ratingA - 1000).toBe(1000 - ratingB);
  });

  it("un match nul entre deux joueurs de même niveau ne change rien", () => {
    const { ratingA, ratingB } = computeEloUpdate(1000, 1000, 0.5);
    expect(ratingA).toBe(1000);
    expect(ratingB).toBe(1000);
  });

  it("une victoire surprise (outsider bat le favori) rapporte plus qu'une victoire attendue", () => {
    const upset = computeEloUpdate(1000, 1400, 1); // l'outsider (A) bat le favori (B)
    const expected = computeEloUpdate(1400, 1000, 1); // le favori (A) bat l'outsider (B)

    const upsetGain = upset.ratingA - 1000;
    const expectedGain = expected.ratingA - 1400;

    expect(upsetGain).toBeGreaterThan(expectedGain);
    expect(upsetGain).toBe(29);
    expect(expectedGain).toBe(3);
  });

  it("ne descend jamais sous 0, même après une défaite lourde", () => {
    const { ratingA } = computeEloUpdate(15, 0, 0);
    expect(ratingA).toBe(0);
    expect(ratingA).toBeGreaterThanOrEqual(0);
  });
});
