import pool from "../config/db.js";
import * as rankingRepo from "../ranking/rankingRepository.js";
import { getTierForRating, getDisplayTier, PLACEMENT_GAMES } from "../ranking/tiers.js";

export async function getLeaderboard(req, res) {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const players = await rankingRepo.getLeaderboard(limit);

  const leaderboard = players.map((player, index) => {
    const position = index + 1;
    const tier = getTierForRating(player.rating, player.ranked_games);
    return {
      position,
      id: player.id,
      username: player.username,
      avatar: player.avatar,
      rating: player.rating,
      tier: getDisplayTier(tier, position),
    };
  });

  const [rows] = await pool.query(
    "SELECT rating, ranked_games FROM users WHERE id = ?",
    [req.session.userId]
  );
  const me = rows[0];
  const meTier = getTierForRating(me.rating, me.ranked_games);
  const mePosition =
    me.ranked_games >= PLACEMENT_GAMES ? await rankingRepo.getUserPosition(req.session.userId, me.rating) : null;
  const you = {
    rating: me.rating,
    rankedGames: me.ranked_games,
    tier: getDisplayTier(meTier, mePosition),
    position: mePosition,
  };

  res.json({ leaderboard, you });
}
