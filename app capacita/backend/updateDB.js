const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('Connected to MySQL server. Updating database schema...');

        // 1. Añadir rol 'monitor' a users
        await connection.query(`ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'model', 'monitor') DEFAULT 'model';`);
        console.log('Updated users table (added monitor role).');

        // 2. Añadir target_role a levels
        // Usamos un bloque try-catch por si la columna ya existe
        try {
            await connection.query(`ALTER TABLE levels ADD COLUMN target_role ENUM('model', 'monitor', 'both') DEFAULT 'both' AFTER description;`);
            console.log('Updated levels table (added target_role).');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('target_role column already exists in levels.');
            } else {
                throw e;
            }
        }

        // 3. Crear tabla content_views
        await connection.query(`
            CREATE TABLE IF NOT EXISTS content_views (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                content_id INT NOT NULL,
                watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
                UNIQUE(user_id, content_id)
            );
        `);
        console.log('Created content_views table.');

        // Actualizar schema.sql para futuras instalaciones
        const fs = require('fs');
        const path = require('path');
        let schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf-8');
        
        schema = schema.replace(
            "role ENUM('admin', 'model') DEFAULT 'model',",
            "role ENUM('admin', 'model', 'monitor') DEFAULT 'model',"
        );
        
        if (!schema.includes('target_role ENUM')) {
            schema = schema.replace(
                "description TEXT,",
                "description TEXT,\n    target_role ENUM('model', 'monitor', 'both') DEFAULT 'both' COMMENT 'Para quién es este nivel',"
            );
        }

        if (!schema.includes('CREATE TABLE IF NOT EXISTS content_views')) {
            schema += `
CREATE TABLE IF NOT EXISTS content_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content_id INT NOT NULL,
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE,
    UNIQUE(user_id, content_id)
);
`;
        }

        fs.writeFileSync(path.join(__dirname, '../database/schema.sql'), schema);
        console.log('Updated schema.sql file.');

        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error updating database:', error);
        process.exit(1);
    }
}

updateDB();
