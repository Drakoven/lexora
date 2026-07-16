import pool from "../config/db.js";
import { AVATAR_KEYS } from "../constants/avatars.js";
import { getTierForRating, getDisplayTier, PLACEMENT_GAMES } from "../ranking/tiers.js";
import { getUserPosition } from "../ranking/rankingRepository.js";

const SELECT_PROFILE_COLUMNS =
  "id, username, email, avatar, games_played, wins, losses, rating, ranked_games, " +
  "current_streak, best_streak, highest_score, created_at";

async function toProfile(row) {
  const tier = getTierForRating(row.rating, row.ranked_games);
  const leaderboardPosition =
    row.ranked_games >= PLACEMENT_GAMES ? await getUserPosition(row.id, row.rating) : null;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatar: row.avatar,
    gamesPlayed: row.games_played,
    wins: row.wins,
    losses: row.losses,
    currentStreak: row.current_streak,
    bestStreak: row.best_streak,
    highestScore: row.highest_score,
    rating: row.rating,
    rankedGames: row.ranked_games,
    tier: getDisplayTier(tier, leaderboardPosition),
    leaderboardPosition,
    createdAt: row.created_at,
  };
}

export async function getProfile(req, res) {
  const [rows] = await pool.query(`SELECT ${SELECT_PROFILE_COLUMNS} FROM users WHERE id = ?`, [
    req.session.userId,
  ]);

  const user = rows[0];

  if (!user) {
    return res.status(401).json({ message: "Non connecté." });
  }

  res.json(await toProfile(user));
}

export async function updateAvatar(req, res) {
  const { avatar } = req.body;

  if (!AVATAR_KEYS.includes(avatar)) {
    return res.status(400).json({ message: "Avatar invalide." });
  }

  await pool.query("UPDATE users SET avatar = ? WHERE id = ?", [
    avatar,
    req.session.userId,
  ]);

  const [rows] = await pool.query(`SELECT ${SELECT_PROFILE_COLUMNS} FROM users WHERE id = ?`, [
    req.session.userId,
  ]);

  res.json(await toProfile(rows[0]));
}
