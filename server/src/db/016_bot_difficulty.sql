-- Référence : migration exécutée directement via le CLI mysql.
-- Difficulté choisie à la création d'une partie contre le bot (NULL pour
-- toute partie qui n'est pas contre le bot).
ALTER TABLE games
  ADD COLUMN bot_difficulty ENUM('easy','medium','hard') NULL;
