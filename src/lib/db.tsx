import mysql from 'mysql2/promise';

// استفاده از شی global برای نگهداری کانکشن در حین Hot Reload
const globalForDb = global as unknown as { pool: mysql.Pool };

export const pool = globalForDb.pool || mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10, // این عدد را روی 10 نگه دارید تا فشار روی دیتابیس کم باشد
  queueLimit: 0,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool;
}