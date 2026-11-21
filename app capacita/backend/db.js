const mysql = require('mysql2/promise');
require('dotenv').config();

const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

const pool = connectionUrl
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

module.exports = pool;
