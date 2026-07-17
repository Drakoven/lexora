-- Référence : migration exécutée directement via le CLI mysql.
-- Un utilisateur peut avoir plusieurs abonnements (un par navigateur/appareil).
-- endpoint identifie un abonnement précis chez le provider push du navigateur ;
-- se ré-abonner avec le même remplace simplement l'ancien (UNIQUE).
CREATE TABLE push_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  endpoint VARCHAR(500) NOT NULL UNIQUE,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
