-- Fichier combiné pour un premier déploiement (import unique via phpMyAdmin).
-- Concatène schema.sql + 002 à 016 dans l'ordre, sans CREATE DATABASE/USE
-- (la base est déjà créée et sélectionnée côté hébergeur).

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(32) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users
  ADD COLUMN avatar VARCHAR(20) NOT NULL DEFAULT 'fox',
  ADD COLUMN games_played INT NOT NULL DEFAULT 0,
  ADD COLUMN wins INT NOT NULL DEFAULT 0,
  ADD COLUMN losses INT NOT NULL DEFAULT 0;

CREATE TABLE games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  player1_id INT NOT NULL,
  player2_id INT NULL,
  board JSON NOT NULL,
  bag JSON NOT NULL,
  rack1 JSON NOT NULL,
  rack2 JSON NOT NULL,
  score1 INT NOT NULL DEFAULT 0,
  score2 INT NOT NULL DEFAULT 0,
  current_player TINYINT NOT NULL DEFAULT 0,
  consecutive_passes INT NOT NULL DEFAULT 0,
  status ENUM('waiting','playing','finished') NOT NULL DEFAULT 'waiting',
  turn_started_at DATETIME NULL,
  winner TINYINT NULL,
  match_type ENUM('code','random') NOT NULL DEFAULT 'code',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (player1_id) REFERENCES users(id),
  FOREIGN KEY (player2_id) REFERENCES users(id)
);

CREATE TABLE friendships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id INT NOT NULL,
  addressee_id INT NOT NULL,
  status ENUM('pending','accepted') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id),
  FOREIGN KEY (addressee_id) REFERENCES users(id),
  UNIQUE KEY unique_pair (requester_id, addressee_id)
);

ALTER TABLE games
  ADD COLUMN invited_user_id INT NULL,
  ADD FOREIGN KEY (invited_user_id) REFERENCES users(id),
  MODIFY COLUMN match_type ENUM('code','random','friend') NOT NULL DEFAULT 'code';

CREATE TABLE sessions (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  expires INT(11) UNSIGNED NOT NULL,
  data MEDIUMTEXT COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

ALTER TABLE users
  ADD COLUMN rating INT NOT NULL DEFAULT 0,
  ADD COLUMN ranked_games INT NOT NULL DEFAULT 0,
  ADD INDEX idx_rating (rating);

ALTER TABLE users
  ADD COLUMN current_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN best_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN highest_score INT NOT NULL DEFAULT 0;

ALTER TABLE users
  ADD COLUMN best_rating INT NOT NULL DEFAULT 0;

CREATE TABLE game_moves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  player_index TINYINT NOT NULL,
  move_type ENUM('place', 'exchange', 'pass') NOT NULL,
  detail JSON NULL,
  score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

ALTER TABLE users
  ADD COLUMN reset_token_hash VARCHAR(255) NULL,
  ADD COLUMN reset_token_expires_at DATETIME NULL;

ALTER TABLE users
  ADD COLUMN email_verified_at DATETIME NULL,
  ADD COLUMN email_verify_token_hash VARCHAR(255) NULL,
  ADD COLUMN email_verify_token_expires_at DATETIME NULL;

ALTER TABLE users
  ADD COLUMN google_id VARCHAR(255) NULL UNIQUE,
  ADD COLUMN facebook_id VARCHAR(255) NULL UNIQUE,
  MODIFY COLUMN password_hash VARCHAR(255) NULL;

CREATE TABLE push_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  endpoint VARCHAR(500) NOT NULL UNIQUE,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE rating_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_id INT NULL,
  rating INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL,
  INDEX idx_user_created (user_id, created_at)
);

ALTER TABLE games
  MODIFY COLUMN match_type ENUM('code','random','friend','bot') NOT NULL DEFAULT 'code';

ALTER TABLE games
  ADD COLUMN bot_difficulty ENUM('easy','medium','hard') NULL;

ALTER TABLE users
  ADD COLUMN daily_streak_current INT NOT NULL DEFAULT 0,
  ADD COLUMN daily_streak_best INT NOT NULL DEFAULT 0,
  ADD COLUMN daily_streak_last_date VARCHAR(10) NULL;
