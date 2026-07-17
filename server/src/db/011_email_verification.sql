-- Référence : migration exécutée directement via le CLI mysql.
-- NULL = email non vérifié ; une fois vérifié, on garde la date (jamais remis à NULL).
ALTER TABLE users
  ADD COLUMN email_verified_at DATETIME NULL,
  ADD COLUMN email_verify_token_hash VARCHAR(255) NULL,
  ADD COLUMN email_verify_token_expires_at DATETIME NULL;
