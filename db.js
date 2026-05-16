import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
    const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
    const url = new URL(dbUrl);

    return {
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, '')
    };
  }

  return {
    host: process.env.DB_HOST || process.env.MYSQL_HOST,
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
    user: process.env.DB_USER || process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.DB_DATABASE
  };
};

const pool = mysql.createPool({
  ...getDatabaseConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
