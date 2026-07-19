// Partage Facebook via le "Share Dialog" classique (sharer.php) — pas de
// SDK, pas d'App ID, pas de permission particulière requise côté Meta.
// Le texte pré-rempli vient de `quote`, la carte affichée vient des balises
// Open Graph de la page ciblée par `url` (voir index.html).
export function shareOnFacebook({ url, quote }) {
  const params = new URLSearchParams({ u: url });
  if (quote) params.set("quote", quote);
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
  window.open(shareUrl, "facebook-share", "width=580,height=470,noopener,noreferrer");
}
