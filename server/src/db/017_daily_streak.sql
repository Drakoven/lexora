-- Série de jours consécutifs joués (concept différent de current_streak/
-- best_streak qui suivent les victoires consécutives, voir 007_stats.sql).
-- daily_streak_last_date est une chaîne "YYYY-MM-DD" plutôt qu'un DATE pour
-- éviter les conversions de fuseau horaire de mysql2 sur ce type — toute la
-- comparaison de dates se fait côté application.
ALTER TABLE users
  ADD COLUMN daily_streak_current INT NOT NULL DEFAULT 0,
  ADD COLUMN daily_streak_best INT NOT NULL DEFAULT 0,
  ADD COLUMN daily_streak_last_date VARCHAR(10) NULL;
