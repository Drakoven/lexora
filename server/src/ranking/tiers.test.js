import { describe, it, expect } from "vitest";
import { getTierForRating, getDisplayTier, PLACEMENT_GAMES } from "./tiers.js";

describe("getTierForRating", () => {
  it("reste non classé avant la fin des parties de placement", () => {
    const tier = getTierForRating(2000, PLACEMENT_GAMES - 1);
    expect(tier.key).toBe("unranked");
  });

  it("donne bronze à un rating de 0 une fois classé", () => {
    const tier = getTierForRating(0, PLACEMENT_GAMES);
    expect(tier.key).toBe("bronze");
  });

  it("bascule exactement au seuil d'un palier (>=)", () => {
    expect(getTierForRating(1349, PLACEMENT_GAMES).key).toBe("maitre");
    expect(getTierForRating(1350, PLACEMENT_GAMES).key).toBe("grand_maitre");
  });

  it("plafonne à grand maître pour un rating très élevé", () => {
    const tier = getTierForRating(99999, PLACEMENT_GAMES);
    expect(tier.key).toBe("grand_maitre");
  });
});

describe("getDisplayTier", () => {
  it("ne change rien pour un palier autre que grand maître", () => {
    const tier = { key: "or", label: "Or" };
    expect(getDisplayTier(tier, 1)).toEqual(tier);
  });

  it("ne change rien sans position au classement", () => {
    const tier = { key: "grand_maitre", label: "Grand Maître" };
    expect(getDisplayTier(tier, null)).toEqual(tier);
    expect(getDisplayTier(tier, undefined)).toEqual(tier);
  });

  it("affiche #1 uniquement à la toute première position", () => {
    const tier = { key: "grand_maitre", label: "Grand Maître" };
    expect(getDisplayTier(tier, 1).key).toBe("rank_one");
    expect(getDisplayTier(tier, 2).key).toBe("top10");
  });

  it("respecte les seuils Top 10 / Top 50 / Top 100 / Top 500", () => {
    const tier = { key: "grand_maitre", label: "Grand Maître" };
    expect(getDisplayTier(tier, 10).key).toBe("top10");
    expect(getDisplayTier(tier, 11).key).toBe("top50");
    expect(getDisplayTier(tier, 50).key).toBe("top50");
    expect(getDisplayTier(tier, 51).key).toBe("top100");
    expect(getDisplayTier(tier, 500).key).toBe("top500");
  });

  it("revient au libellé fixe au-delà du Top 500", () => {
    const tier = { key: "grand_maitre", label: "Grand Maître" };
    expect(getDisplayTier(tier, 501)).toEqual(tier);
  });
});
