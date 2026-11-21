CREATE DATABASE IF NOT EXISTS app_models;
USE app_models;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'model', 'monitor') DEFAULT 'model',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS levels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    target_role ENUM('model', 'monitor', 'both') DEFAULT 'both' COMMENT 'Para quién es este nivel',
    unlock_days INT DEFAULT 0 COMMENT 'Días que deben transcurrir para desbloquear este nivel',
    order_num INT NOT NULL COMMENT 'Para ordenar los niveles lógicamente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level_id INT NOT NULL,
    type ENUM('video', 'pdf', 'text') NOT NULL,
    title VARCHAR(150) NOT NULL,
    content_url_or_text TEXT NOT NULL COMMENT 'URL del archivo subido o texto plano/HTML',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    level_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
    UNIQUE(user_id, level_id)
);

CREATE TABLE IF NOT EXISTS content_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content_id INT NOT NULL,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
    UNIQUE(user_id, content_id)
);

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL COMMENT 'Array de opciones en JSON',
    correct_index INT NOT NULL COMMENT 'Índice de la respuesta correcta (0-3)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
);

-- Insert a default admin for testing
-- The password 'admin123' should be generated correctly later, but we will seed the DB here temporarily.
-- Or better, we handle insertions in the backend. I will add an admin manually later or through initialization script.
