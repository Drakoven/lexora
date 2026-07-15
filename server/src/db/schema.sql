-- Référence : schéma exécuté manuellement par l'utilisateur (voir plan de sprint).
CREATE DATABASE IF NOT EXISTS lexora CHARACTER SET utf8mb4;

USE lexora;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(32) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
