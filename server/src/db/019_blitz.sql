-- Référence : migration exécutée directement via le CLI mysql.
-- Mode blitz pour le matchmaking aléatoire et les parties contre le bot :
-- tour de 30s au lieu du timeout async de 48h. Immuable après création,
-- comme match_type/bot_difficulty.
ALTER TABLE games
  ADD COLUMN is_blitz TINYINT(1) NOT NULL DEFAULT 0;
