-- Référence : migration exécutée directement via le CLI mysql (voir plan de sprint Profil).
ALTER TABLE users
  ADD COLUMN avatar VARCHAR(20) NOT NULL DEFAULT 'fox',
  ADD COLUMN games_played INT NOT NULL DEFAULT 0,
  ADD COLUMN wins INT NOT NULL DEFAULT 0,
  ADD COLUMN losses INT NOT NULL DEFAULT 0;
