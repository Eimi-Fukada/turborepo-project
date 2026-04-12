import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  port: 3306,
  user: "grace_xhs1_user",
  password: "QWERqwer8790*&()",
  database: "user_info",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

export default pool;

// 数据库连接测试
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("数据库连接成功");
    connection.release();
    return true;
  } catch (error) {
    console.error("数据库连接失败:", error);
    return false;
  }
}
