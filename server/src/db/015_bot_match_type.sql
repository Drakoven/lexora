-- Référence : migration exécutée directement via le CLI mysql.
-- Nouveau type de partie pour le bot d'entraînement — même mécanisme que
-- l'ajout de 'friend' dans 004_friendships.sql.
ALTER TABLE games
  MODIFY COLUMN match_type ENUM('code','random','friend','bot') NOT NULL DEFAULT 'code';
