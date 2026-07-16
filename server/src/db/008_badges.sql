-- Référence : migration exécutée directement via le CLI mysql (voir suite du sprint mode compétitif).
-- best_rating suit le rating le plus haut jamais atteint (le rating courant
-- peut redescendre, mais un badge de palier une fois débloqué doit le rester).
ALTER TABLE users
  ADD COLUMN best_rating INT NOT NULL DEFAULT 0;
