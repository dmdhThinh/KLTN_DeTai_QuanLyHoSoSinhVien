import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  timezone: 'Z',
  charset: 'utf8mb4'  // ✅ Hỗ trợ tiếng Việt
})
pool.getConnection()
  .then(conn => {
    console.log('✅ Connected successfully!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
  });
