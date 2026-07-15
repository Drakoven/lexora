import pool from "../config/db.js";

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

async function generateUniqueCode() {
  for (;;) {
    const code = Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
    const [rows] = await pool.query("SELECT id FROM games WHERE code = ?", [code]);
    if (rows.length === 0) return code;
  }
}

function toRow(game) {
  return {
    code: game.code,
    player1_id: game.player1Id,
    player2_id: game.player2Id,
    board: JSON.stringify(game.board),
    bag: JSON.stringify(game.bag),
    rack1: JSON.stringify(game.rack1),
    rack2: JSON.stringify(game.rack2),
    score1: game.score1,
    score2: game.score2,
    current_player: game.currentPlayer,
    consecutive_passes: game.consecutivePasses,
    status: game.status,
    turn_started_at: game.turnStartedAt,
    winner: game.winner,
    match_type: game.matchType,
  };
}

function fromRow(row) {
  return {
    id: row.id,
    code: row.code,
    player1Id: row.player1_id,
    player2Id: row.player2_id,
    board: row.board,
    bag: row.bag,
    rack1: row.rack1,
    rack2: row.rack2,
    score1: row.score1,
    score2: row.score2,
    currentPlayer: row.current_player,
    consecutivePasses: row.consecutive_passes,
    status: row.status,
    turnStartedAt: row.turn_started_at,
    winner: row.winner,
    matchType: row.match_type,
    updatedAt: row.updated_at,
    player1: row.player1_username ? { username: row.player1_username, avatar: row.player1_avatar } : undefined,
    player2: row.player2_username ? { username: row.player2_username, avatar: row.player2_avatar } : undefined,
  };
}

const SELECT_WITH_PLAYERS = `
  SELECT g.*, u1.username AS player1_username, u1.avatar AS player1_avatar,
         u2.username AS player2_username, u2.avatar AS player2_avatar
  FROM games g
  JOIN users u1 ON u1.id = g.player1_id
  LEFT JOIN users u2 ON u2.id = g.player2_id
`;

export async function createGame(game) {
  const code = await generateUniqueCode();
  const row = toRow({ ...game, code });
  const [result] = await pool.query(
    `INSERT INTO games (code, player1_id, player2_id, board, bag, rack1, rack2, score1, score2,
       current_player, consecutive_passes, status, turn_started_at, winner, match_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      row.code,
      row.player1_id,
      row.player2_id,
      row.board,
      row.bag,
      row.rack1,
      row.rack2,
      row.score1,
      row.score2,
      row.current_player,
      row.consecutive_passes,
      row.status,
      row.turn_started_at,
      row.winner,
      row.match_type,
    ]
  );
  return getGameById(result.insertId);
}

export async function getGameById(id) {
  const [rows] = await pool.query(`${SELECT_WITH_PLAYERS} WHERE g.id = ?`, [id]);
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function getGameByCode(code) {
  const [rows] = await pool.query(`${SELECT_WITH_PLAYERS} WHERE g.code = ?`, [code]);
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function findWaitingRandomGame(excludeUserId) {
  const [rows] = await pool.query(
    `${SELECT_WITH_PLAYERS}
     WHERE g.status = 'waiting' AND g.match_type = 'random' AND g.player1_id != ?
     ORDER BY g.created_at ASC LIMIT 1`,
    [excludeUserId]
  );
  return rows[0] ? fromRow(rows[0]) : undefined;
}

export async function deleteGame(id) {
  await pool.query("DELETE FROM games WHERE id = ?", [id]);
}

export async function getGamesForUser(userId) {
  const [rows] = await pool.query(
    `${SELECT_WITH_PLAYERS} WHERE g.player1_id = ? OR g.player2_id = ? ORDER BY g.updated_at DESC`,
    [userId, userId]
  );

  return rows.map(fromRow);
}

export async function saveGame(game) {
  const row = toRow(game);
  await pool.query(
    `UPDATE games SET
       player2_id = ?, board = ?, bag = ?, rack1 = ?, rack2 = ?, score1 = ?, score2 = ?,
       current_player = ?, consecutive_passes = ?, status = ?, turn_started_at = ?, winner = ?
     WHERE id = ?`,
    [
      row.player2_id,
      row.board,
      row.bag,
      row.rack1,
      row.rack2,
      row.score1,
      row.score2,
      row.current_player,
      row.consecutive_passes,
      row.status,
      row.turn_started_at,
      row.winner,
      game.id,
    ]
  );
  return getGameById(game.id);
}
