const K_FACTOR = 32;

export function computeEloUpdate(ratingA, ratingB, scoreA) {
  const expectedA = 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;
  const scoreB = 1 - scoreA;

  const newRatingA = Math.max(0, Math.round(ratingA + K_FACTOR * (scoreA - expectedA)));
  const newRatingB = Math.max(0, Math.round(ratingB + K_FACTOR * (scoreB - expectedB)));

  return { ratingA: newRatingA, ratingB: newRatingB };
}
