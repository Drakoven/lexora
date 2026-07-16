-- Référence : migration exécutée directement via le CLI mysql (voir plan de sprint liste d'amis).
CREATE TABLE friendships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id INT NOT NULL,
  addressee_id INT NOT NULL,
  status ENUM('pending','accepted') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id),
  FOREIGN KEY (addressee_id) REFERENCES users(id),
  UNIQUE KEY unique_pair (requester_id, addressee_id)
);

ALTER TABLE games
  ADD COLUMN invited_user_id INT NULL,
  ADD FOREIGN KEY (invited_user_id) REFERENCES users(id),
  MODIFY COLUMN match_type ENUM('code','random','friend') NOT NULL DEFAULT 'code';
