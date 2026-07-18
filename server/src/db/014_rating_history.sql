-- Référence : migration exécutée directement via le CLI mysql.
-- Une ligne par changement de rating (donc par partie classée jouée),
-- pour pouvoir tracer l'évolution du rating dans le temps sur le profil.
-- game_id nullable + ON DELETE SET NULL : garde le point du graphique même
-- si la partie elle-même venait à être supprimée un jour.
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
