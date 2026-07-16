import { TIERS, PLACEMENT_GAMES } from "../ranking/tiers.js";

function tierMinRating(key) {
  return TIERS.find((t) => t.key === key).minRating;
}

function reachedTier(stats, key) {
  return stats.rankedGames >= PLACEMENT_GAMES && stats.bestRating >= tierMinRating(key);
}

export const BADGES = [
  {
    key: "first_game",
    label: "Premiers pas",
    emoji: "🌱",
    description: "Joue ta première partie.",
    check: (s) => s.gamesPlayed >= 1,
  },
  {
    key: "veteran_25",
    label: "Habitué",
    emoji: "📅",
    description: "Joue 25 parties.",
    check: (s) => s.gamesPlayed >= 25,
  },
  {
    key: "veteran_100",
    label: "Vétéran",
    emoji: "🎖️",
    description: "Joue 100 parties.",
    check: (s) => s.gamesPlayed >= 100,
  },
  {
    key: "first_win",
    label: "Première victoire",
    emoji: "🏆",
    description: "Remporte ta première partie.",
    check: (s) => s.wins >= 1,
  },
  {
    key: "wins_25",
    label: "Redoutable",
    emoji: "⚔️",
    description: "Remporte 25 parties.",
    check: (s) => s.wins >= 25,
  },
  {
    key: "wins_100",
    label: "Champion",
    emoji: "👑",
    description: "Remporte 100 parties.",
    check: (s) => s.wins >= 100,
  },
  {
    key: "streak_3",
    label: "Sur une lancée",
    emoji: "🔥",
    description: "Gagne 3 parties d'affilée.",
    check: (s) => s.bestStreak >= 3,
  },
  {
    key: "streak_5",
    label: "Imparable",
    emoji: "☄️",
    description: "Gagne 5 parties d'affilée.",
    check: (s) => s.bestStreak >= 5,
  },
  {
    key: "streak_10",
    label: "Invincible",
    emoji: "🌟",
    description: "Gagne 10 parties d'affilée.",
    check: (s) => s.bestStreak >= 10,
  },
  {
    key: "score_100",
    label: "Bon score",
    emoji: "✨",
    description: "Marque 100 points en une partie.",
    check: (s) => s.highestScore >= 100,
  },
  {
    key: "score_150",
    label: "Excellent score",
    emoji: "💥",
    description: "Marque 150 points en une partie.",
    check: (s) => s.highestScore >= 150,
  },
  {
    key: "score_200",
    label: "Score exceptionnel",
    emoji: "🚀",
    description: "Marque 200 points en une partie.",
    check: (s) => s.highestScore >= 200,
  },
  {
    key: "reach_diamant",
    label: "Diamant atteint",
    emoji: "💎",
    description: "Atteins le palier Diamant en classé.",
    check: (s) => reachedTier(s, "diamant"),
  },
  {
    key: "reach_maitre",
    label: "Maître atteint",
    emoji: "🎓",
    description: "Atteins le palier Maître en classé.",
    check: (s) => reachedTier(s, "maitre"),
  },
  {
    key: "reach_grand_maitre",
    label: "Grand Maître atteint",
    emoji: "🏅",
    description: "Atteins le palier Grand Maître en classé.",
    check: (s) => reachedTier(s, "grand_maitre"),
  },
  {
    key: "social",
    label: "Sociable",
    emoji: "🤝",
    description: "Ajoute un ami.",
    check: (s) => s.friendCount >= 1,
  },
];

export function evaluateBadges(stats) {
  return BADGES.map((badge) => ({
    key: badge.key,
    label: badge.label,
    emoji: badge.emoji,
    description: badge.description,
    earned: badge.check(stats),
  }));
}
