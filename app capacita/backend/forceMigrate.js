const pool = require('./db');

async function forceMigrate() {
    console.log('Forcing DB migration...');
    try {
        await pool.query(`ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'model', 'monitor') DEFAULT 'model';`);
        console.log('users table updated.');
    } catch(e) { console.log(e.message); }

    try {
        await pool.query(`ALTER TABLE levels ADD COLUMN target_role ENUM('model', 'monitor', 'both') DEFAULT 'both' AFTER description;`);
        console.log('levels table updated.');
    } catch(e) { console.log(e.message); }

    try {
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
        console.log('content_views created.');
    } catch(e) { console.log(e.message); }

    process.exit(0);
}

forceMigrate();
