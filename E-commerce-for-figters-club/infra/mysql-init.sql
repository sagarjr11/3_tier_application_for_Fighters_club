-- Percona MySQL init
CREATE DATABASE IF NOT EXISTS ecommerce_transactions
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecommerce_transactions;

CREATE TABLE IF NOT EXISTS transactions (
  id             VARCHAR(36)   PRIMARY KEY,
  order_id       VARCHAR(36)   NOT NULL,
  user_id        VARCHAR(36)   NOT NULL,
  amount         DECIMAL(10,2) NOT NULL,
  currency       VARCHAR(3)    DEFAULT 'INR',
  status         ENUM('pending','success','failed','refunded') DEFAULT 'pending',
  payment_method VARCHAR(50)   NOT NULL,
  gateway_txn_id VARCHAR(100),
  created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id),
  INDEX idx_user_id  (user_id),
  INDEX idx_status   (status)
);

CREATE TABLE IF NOT EXISTS payment_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  txn_id     VARCHAR(36)  NOT NULL,
  event      VARCHAR(100) NOT NULL,
  payload    JSON,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_txn_id (txn_id)
);

SELECT 'MySQL tables initialized' AS status;
