import pool from "../config/db.js";
import * as friendsRepo from "../friends/friendsRepository.js";
import { evaluateBadges } from "./badges.js";

export async function getBadgesForUser(userId) {
  const [rows] = await pool.query(
    "SELECT games_played, wins, best_streak, highest_score, best_rating, ranked_games FROM users WHERE id = ?",
    [userId]
  );
  const user = rows[0];
  const friends = await friendsRepo.listAcceptedFriends(userId);

  return evaluateBadges({
    gamesPlayed: user.games_played,
    wins: user.wins,
    bestStreak: user.best_streak,
    highestScore: user.highest_score,
    bestRating: user.best_rating,
    rankedGames: user.ranked_games,
    friendCount: friends.length,
  });
}
