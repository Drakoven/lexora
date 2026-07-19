// Couleurs choisies pour rester dans la même famille de teinte que le badge
// tout en passant 4.5:1 sur --color-background-soft (#172033), le fond
// utilisé partout où ce texte s'affiche (classement, profil) — bronze,
// rubis et saphir échouaient (3.88/3.98/4.12) avec leurs teintes d'origine.
export const TIER_STYLES = {
  unranked: { color: "#8a8a9a" },
  bronze: { color: "#c9814d" },
  argent: { color: "#b8bec7" },
  or: { color: "#e0b23e" },
  platine: { color: "#5fd0c9" },
  emeraude: { color: "#3fbf6c" },
  rubis: { color: "#e8637c" },
  saphir: { color: "#5f96e8" },
  diamant: { color: "#8ae0ff" },
  maitre: { color: "#c15fe0" },
  grand_maitre: { color: "#ffcf40" },
  top500: { color: "#ffcf40" },
  top100: { color: "#ffc11a" },
  top50: { color: "#ffaf00" },
  top10: { color: "#ff9200" },
  rank_one: { color: "#ff6a00" },
};
