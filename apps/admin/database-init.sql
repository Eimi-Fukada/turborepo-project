-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS user_info;

-- 使用数据库
USE user_info;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入一个测试用户（可选）
-- 注意：密码应该是加密的，这里为了演示使用明文
INSERT IGNORE INTO users (username, password, email) VALUES 
('admin', 'ant.design', 'admin@example.com');

-- 查询表结构确认
DESCRIBE users;