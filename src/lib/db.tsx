// lib/db.ts
import mysql from 'mysql2/promise';

// مطمئن شوید که .env بارگذاری شده است
if (!process.env.DB_HOST) {
  throw new Error('Please define DB_HOST in your .env file');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
