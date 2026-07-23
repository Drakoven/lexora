-- Une tentative par joueur et par jour (challenge_date en "YYYY-MM-DD", même
-- convention que daily_streak_last_date dans 017 -- pas de type DATE pour
-- éviter les conversions de fuseau horaire de mysql2, toute la comparaison
-- se fait côté application).
CREATE TABLE daily_challenge_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  challenge_date VARCHAR(10) NOT NULL,
  move_id INT NOT NULL,
  target_score INT NOT NULL,
  your_score INT NOT NULL,
  words JSON NULL,
  won TINYINT(1) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_date (user_id, challenge_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
