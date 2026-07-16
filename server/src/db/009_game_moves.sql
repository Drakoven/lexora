-- Référence : migration exécutée directement via le CLI mysql.
-- Historique des coups d'une partie en ligne (jamais construit jusqu'ici —
-- seuls les compteurs agrégés existaient). Le jeu local (pass-and-play)
-- n'est pas concerné : il n'est jamais persisté en base.
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
