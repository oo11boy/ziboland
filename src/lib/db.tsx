// lib/db.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'ziboland',
  password: process.env.MYSQL_PASSWORD || 'Ra13781379',
  database: process.env.MYSQL_DATABASE || 'ziboland',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;