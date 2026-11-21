const mysql = require('mysql2/promise');
const pool = require('./db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function runMigrations() {
    // 1. Conexión directa a MySQL sin especificar base de datos para crearla si no existe
    const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
    if (!connectionUrl) {
        let rootConn;
        try {
            rootConn = await mysql.createConnection({
                host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
                port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
                user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
                password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
            });

            const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'app_models';
            await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
            console.log(`[Database] Base de datos "${dbName}" lista.`);
        } catch (err) {
            if (err.code === 'ER_ACCESS_DENIED_ERROR') {
                console.warn('\n⚠️  [MySQL] Acceso denegado (usuario o contraseña de MySQL incorrectos).\n');
                return;
            }
            console.log('[Database] MySQL no detectado en este entorno; activando base de datos integrada (SQLite)...');
            if (typeof pool.enableSqliteFallback === 'function') {
                pool.enableSqliteFallback();
            }
        } finally {
            if (rootConn) {
                try { await rootConn.end(); } catch (e) {}
            }
        }
    }

    // 2. Conexión con el pool para crear tablas y migraciones
    try {
        console.log('[Database] Verificando tablas y estructura...');

        // Tabla users
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'model', 'monitor') DEFAULT 'model',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tabla levels
        await pool.query(`
            CREATE TABLE IF NOT EXISTS levels (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT,
                target_role ENUM('model', 'monitor', 'both') DEFAULT 'both' COMMENT 'Para quién es este nivel',
                unlock_days INT DEFAULT 0 COMMENT 'Días que deben transcurrir para desbloquear este nivel',
                order_num INT NOT NULL COMMENT 'Para ordenar los niveles lógicamente',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Tabla contents
        await pool.query(`
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

        // Tabla user_progress
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                level_id INT NOT NULL,
                unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (level_id) REFERENCES levels(id) ON DELETE CASCADE,
                UNIQUE(user_id, level_id)
            );
        `);

        // Tabla content_views
        await pool.query(`
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

        // Tabla questions
        await pool.query(`
            CREATE TABLE IF NOT EXISTS questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                content_id INT NOT NULL,
                question_text TEXT NOT NULL,
                options JSON NOT NULL COMMENT 'Array de opciones en JSON',
                correct_index INT NOT NULL COMMENT 'Índice de la respuesta correcta (0-3)',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE
            );
        `);

        // Crear usuario administrador por defecto si no hay ninguno
        const [existingAdmins] = await pool.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
        if (existingAdmins.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(`
                INSERT INTO users (name, email, password, role) 
                VALUES ('Administrador', 'admin@admin.com', ?, 'admin')
            `, [hashedPassword]);
            console.log('[Database] Usuario administrador creado por defecto: admin@admin.com / admin123');
        }

        console.log('[Database] Todas las tablas y datos base sincronizados con éxito.');
    } catch (error) {
        console.error('[Database] Advertencia en migraciones:', error.message || error);
    }
}

module.exports = { runMigrations };
