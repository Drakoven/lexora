import pool from "../config/db.js";

export async function findUserByUsername(username) {
  const [rows] = await pool.query("SELECT id, username, avatar FROM users WHERE username = ?", [username]);
  return rows[0];
}

export async function findFriendship(userIdA, userIdB) {
  const [rows] = await pool.query(
    `SELECT * FROM friendships
     WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)`,
    [userIdA, userIdB, userIdB, userIdA]
  );
  return rows[0];
}

export async function getFriendshipById(id) {
  const [rows] = await pool.query("SELECT * FROM friendships WHERE id = ?", [id]);
  return rows[0];
}

export async function createRequest(requesterId, addresseeId) {
  const [result] = await pool.query(
    "INSERT INTO friendships (requester_id, addressee_id, status) VALUES (?, ?, 'pending')",
    [requesterId, addresseeId]
  );
  return getFriendshipById(result.insertId);
}

export async function acceptRequest(id) {
  await pool.query("UPDATE friendships SET status = 'accepted' WHERE id = ?", [id]);
}

export async function deleteFriendship(id) {
  await pool.query("DELETE FROM friendships WHERE id = ?", [id]);
}

export async function listAcceptedFriends(userId) {
  const [rows] = await pool.query(
    `SELECT f.id AS friendship_id, u.id, u.username, u.avatar
     FROM friendships f
     JOIN users u ON u.id = CASE WHEN f.requester_id = ? THEN f.addressee_id ELSE f.requester_id END
     WHERE f.status = 'accepted' AND (f.requester_id = ? OR f.addressee_id = ?)`,
    [userId, userId, userId]
  );
  return rows;
}

export async function listPendingRequests(userId) {
  const [rows] = await pool.query(
    `SELECT f.id AS friendship_id, u.id, u.username, u.avatar
     FROM friendships f
     JOIN users u ON u.id = f.requester_id
     WHERE f.status = 'pending' AND f.addressee_id = ?`,
    [userId]
  );
  return rows;
}
