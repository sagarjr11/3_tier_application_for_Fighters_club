/**
 * Percona MySQL Connection (mysql2)
 * Used for: Transactions, Payments, Order financials
 * Why Percona/MySQL? ACID compliance — financial data MUST be consistent
 * Percona = MySQL-compatible with better performance and clustering
 */

import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'admin',
  password: process.env.MYSQL_PASSWORD || 'password',
  database: process.env.MYSQL_DATABASE || 'ecommerce_transactions',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

export async function queryDB(
  sql: string,
  params: any[] = []
) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

export async function getConnection() {
  return pool.getConnection()
}

export async function testMySQLConnection() {
  try {
    const conn = await pool.getConnection()

    await conn.query('SELECT 1')

    conn.release()

    console.log('✅ Percona MySQL connected')
  } catch (err) {
    console.error('❌ MySQL connection failed:', err)
    throw err
  }
}

export async function initMySQLTables() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id             VARCHAR(36)   PRIMARY KEY,
      order_id       VARCHAR(36)   NOT NULL,
      user_id        VARCHAR(36)   NOT NULL,
      amount         DECIMAL(10,2) NOT NULL,
      currency       VARCHAR(3)    DEFAULT 'INR',
      status         ENUM('pending','success','failed','refunded')
                     DEFAULT 'pending',
      payment_method VARCHAR(50)   NOT NULL,
      gateway_txn_id VARCHAR(100),
      created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,

      INDEX idx_order_id (order_id),
      INDEX idx_user_id  (user_id),
      INDEX idx_status   (status)
    )
  `)

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS payment_logs (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      txn_id     VARCHAR(36)  NOT NULL,
      event      VARCHAR(100) NOT NULL,
      payload    JSON,
      created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

      INDEX idx_txn_id (txn_id)
    )
  `)

  console.log('✅ MySQL tables initialized')
}

export default pool