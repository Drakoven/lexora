-- Référence : migration exécutée directement via le CLI mysql (voir plan de sprint mode compétitif).
ALTER TABLE users
  ADD COLUMN rating INT NOT NULL DEFAULT 0,
  ADD COLUMN ranked_games INT NOT NULL DEFAULT 0,
  ADD INDEX idx_rating (rating);
