import mysql from "mysql2/promise";
import dotenv from "dotenv";


dotenv.config();


const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DB || 'order_processing_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


export default pool ;
