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
  queueLimit: 0,
  namedPlaceholders: true,
  timezone: 'Z',
  charset: 'utf8mb4',  // ✅ Hỗ trợ tiếng Việt
  connectTimeout: 10000,  // 10 giây timeout khi connect
  acquireTimeout: 10000,  // 10 giây timeout khi lấy connection từ pool
  timeout: 60000,  // 60 giây query timeout
  enableKeepAlive: true,  // Giữ connection sống
  keepAliveInitialDelay: 0
})
pool.getConnection()
  .then(conn => {
    console.log('✅ Connected successfully!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
  });
