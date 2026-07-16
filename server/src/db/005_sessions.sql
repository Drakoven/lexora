-- Référence : migration exécutée directement via le CLI mysql.
-- Schéma standard attendu par express-mysql-session (session store persistant,
-- remplace le MemoryStore par défaut d'express-session qui ne survit pas à un
-- redémarrage du backend).
CREATE TABLE sessions (
  session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
  expires INT(11) UNSIGNED NOT NULL,
  data MEDIUMTEXT COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
