export const PLACEMENT_GAMES = 5;

export const TIERS = [
  { key: "bronze", label: "Bronze", minRating: 0 },
  { key: "argent", label: "Argent", minRating: 150 },
  { key: "or", label: "Or", minRating: 300 },
  { key: "platine", label: "Platine", minRating: 450 },
  { key: "emeraude", label: "Émeraude", minRating: 600 },
  { key: "rubis", label: "Rubis", minRating: 750 },
  { key: "saphir", label: "Saphir", minRating: 900 },
  { key: "diamant", label: "Diamant", minRating: 1050 },
  { key: "maitre", label: "Maître", minRating: 1200 },
  { key: "grand_maitre", label: "Grand Maître", minRating: 1350 },
];

export function getTierForRating(rating, rankedGames) {
  if (rankedGames < PLACEMENT_GAMES) {
    return { key: "unranked", label: "Non classé" };
  }

  let current = TIERS[0];
  for (const tier of TIERS) {
    if (rating >= tier.minRating) current = tier;
  }
  return { key: current.key, label: current.label };
}

// Au sein du palier le plus haut (Grand Maître), le rang affiché devient une
// position dynamique au classement plutôt qu'un palier fixe — voir mémoire
// project-game-design ("Top 500/100/50/10/#1... computed from global
// ranking position, not just a static enum").
const DYNAMIC_TIERS = [
  { key: "rank_one", label: "#1", maxPosition: 1 },
  { key: "top10", label: "Top 10", maxPosition: 10 },
  { key: "top50", label: "Top 50", maxPosition: 50 },
  { key: "top100", label: "Top 100", maxPosition: 100 },
  { key: "top500", label: "Top 500", maxPosition: 500 },
];

export function getDisplayTier(tier, leaderboardPosition) {
  if (tier.key !== "grand_maitre" || leaderboardPosition === null || leaderboardPosition === undefined) {
    return tier;
  }

  const dynamic = DYNAMIC_TIERS.find((d) => leaderboardPosition <= d.maxPosition);
  return dynamic ? { key: dynamic.key, label: dynamic.label } : tier;
}
