import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function initializeDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'test'
    });

    console.log('✅ Conectado a la base de datos');

    // Leer el archivo SQL
    const sqlFile = path.join(process.cwd(), 'db-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar cada comando SQL por separado
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      console.log(`Ejecutando: ${statement.substring(0, 50)}...`);
      try {
        await connection.query(statement);
      } catch (err) {
        console.warn('⚠️ Error ejecutando sentencia (se ignorará):', err.message);
        // continuar con la siguiente sentencia en lugar de abortar toda la inicialización
      }
    }

    console.log('✅ Base de datos inicializada correctamente');
    await connection.end();
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
