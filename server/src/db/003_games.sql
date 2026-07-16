-- Référence : migration exécutée directement via le CLI mysql (voir plan de sprint parties persistantes).
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
