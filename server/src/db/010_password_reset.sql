-- Référence : migration exécutée directement via le CLI mysql.
-- On stocke le hash du token (jamais le token en clair) et son expiration ;
-- comme pour les mots de passe, si la base fuit, les tokens restent inutilisables.
ALTER TABLE users
  ADD COLUMN reset_token_hash VARCHAR(255) NULL,
  ADD COLUMN reset_token_expires_at DATETIME NULL;
