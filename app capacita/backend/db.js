const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

const mysqlPool = connectionUrl
    ? mysql.createPool(connectionUrl)
    : mysql.createPool({
          host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
          port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
          user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
          password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
          database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'app_models',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0
      });

let sqliteDb = null;
let useSqliteFallback = false;

function initSqliteFallback() {
    if (sqliteDb) return sqliteDb;
    const { DatabaseSync } = require('node:sqlite');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const dbPath = path.join(uploadsDir, 'app_models.sqlite');
    sqliteDb = new DatabaseSync(dbPath);
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
    useSqliteFallback = true;
    console.log(`[Database] Modo Cloud SQLite activado automáticamente (${dbPath})`);
    return sqliteDb;
}

function toSqliteSql(sql) {
    return sql
        .replace(/INT\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
        .replace(/ENUM\s*\([^)]+\)/gi, 'TEXT')
        .replace(/\bBOOLEAN\b/gi, 'INTEGER')
        .replace(/\bTRUE\b/gi, '1')
        .replace(/\bFALSE\b/gi, '0')
        .replace(/\bJSON\b/gi, 'TEXT')
        .replace(/COMMENT\s+'[^']*'/gi, '')
        .replace(/INSERT\s+IGNORE\s+INTO/gi, 'INSERT OR IGNORE INTO')
        .replace(/"([^"]+)"/g, "'$1'");
}

function executeSqlite(sql, params = []) {
    const db = initSqliteFallback();
    const cleanSql = toSqliteSql(sql).trim();
    const isSelect = /^SELECT\b/i.test(cleanSql);
    const stmt = db.prepare(cleanSql);
    const safeParams = params.map((p) => (typeof p === 'boolean' ? (p ? 1 : 0) : p));

    if (isSelect) {
        const rows = stmt.all(...safeParams);
        return [rows];
    } else {
        const res = stmt.run(...safeParams);
        return [{
            insertId: Number(res.lastInsertRowid || 0),
            affectedRows: Number(res.changes || 0)
        }];
    }
}

const pool = {
    async query(sql, params = []) {
        if (useSqliteFallback) {
            return executeSqlite(sql, params);
        }
        try {
            return await mysqlPool.query(sql, params);
        } catch (err) {
            if (err.fatal || err.code === 'ECONNREFUSED' || err.code === 'EACCES' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
                return executeSqlite(sql, params);
            }
            throw err;
        }
    },
    enableSqliteFallback() {
        initSqliteFallback();
    }
};

module.exports = pool;
