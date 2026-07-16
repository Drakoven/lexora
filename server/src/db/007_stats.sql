-- Référence : migration exécutée directement via le CLI mysql (voir suite du sprint mode compétitif).
ALTER TABLE users
  ADD COLUMN current_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN best_streak INT NOT NULL DEFAULT 0,
  ADD COLUMN highest_score INT NOT NULL DEFAULT 0;
