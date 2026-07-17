-- Référence : migration exécutée directement via le CLI mysql.
-- google_id/facebook_id : identifiant stable renvoyé par chaque provider,
-- NULL si le compte ne s'est jamais connecté via ce provider. password_hash
-- devient nullable pour les comptes créés uniquement via OAuth (pas de mot
-- de passe local, donc pas de hash fictif) ; login() doit rejeter proprement
-- une tentative de connexion par mot de passe sur ces comptes.
ALTER TABLE users
  ADD COLUMN google_id VARCHAR(255) NULL UNIQUE,
  ADD COLUMN facebook_id VARCHAR(255) NULL UNIQUE,
  MODIFY COLUMN password_hash VARCHAR(255) NULL;
