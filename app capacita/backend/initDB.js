const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        console.log('Connected to MySQL server.');

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
        console.log(`Database ${process.env.DB_NAME} created or already exists.`);

        await connection.query(`USE ${process.env.DB_NAME};`);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'model') DEFAULT 'model',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS levels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT,
                unlock_days INT DEFAULT 0,
                order_num INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS contents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                level_id INT NOT NULL,
                type ENUM('video', 'pdf', 'text') NOT NULL,
                title VARCHAR(150) NOT NULL,
                content_url_or_text TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                level_id INT NOT NULL,
                status ENUM('locked', 'unlocked', 'completed') DEFAULT 'locked',
                unlocked_at DATETIME NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
                UNIQUE(user_id, level_id)
            );
        `);

        console.log('Tables created successfully.');

        // Insert default admin
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query(`
            INSERT IGNORE INTO users (name, email, password, role) 
            VALUES ('Administrador', 'admin@admin.com', ?, 'admin')
        `, [hashedPassword]);
        
        console.log('Default admin created (admin@admin.com / admin123).');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initDB();
