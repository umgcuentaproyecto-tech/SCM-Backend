import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import usersRouter from './routes/usuarios.js';
import rolesRouter from './routes/roles.js';
import gestionPedidosRouter from './routes/gestion_pedidos.js';
import clientesRouter from './routes/clientes.js';
import productosRouter from './routes/productos.js';
import categoriasRouter from './routes/categorias.js';
import inventariosRouter from './routes/inventarios.js';
import almacenesRouter from './routes/almacenes.js';
import ubicacionesRouter from './routes/ubicaciones.js';
import enviosRouter from './routes/envios.js';
import rutasRouter from './routes/rutas.js';
import transportistasRouter from './routes/transportistas.js';
import vehiculosRouter from './routes/vehiculos.js';
import proveedoresRouter from './routes/proveedores.js';
import ordenesRouter from './routes/ordenes.js';
import recepcionesRouter from './routes/recepciones.js';
import comprasRouter from './routes/compras.js';
import finanzasRouter from './routes/finanzas.js';
import db, { getDatabaseConfig } from './db.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar CORS
const defaultOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'];
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : (process.env.NODE_ENV === 'production' ? [] : defaultOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy does not allow access from ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/api/health/db', async (req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    next(err);
  }
});

app.use('/api/usuarios', usersRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/clientes', clientesRouter);
app.use('/api/productos', productosRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/inventarios', inventariosRouter);
app.use('/api/gestion_pedidos', gestionPedidosRouter);
app.use('/api/almacenes', almacenesRouter);
app.use('/api/ubicaciones', ubicacionesRouter);
app.use('/api/envios', enviosRouter);
app.use('/api/rutas', rutasRouter);
app.use('/api/transportistas', transportistasRouter);
app.use('/api/vehiculos', vehiculosRouter);
app.use('/api/proveedores', proveedoresRouter);
app.use('/api/ordenes', ordenesRouter);
app.use('/api/recepciones', recepcionesRouter);
app.use('/api/compras', comprasRouter);
app.use('/api/finanzas', finanzasRouter);
app.use('/api', finanzasRouter);

// Log registered routes for debugging
setTimeout(() => {
    try {
      const routes = [];
      const stack = app._router && app._router.stack ? app._router.stack : [];
      stack.forEach(layer => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
          routes.push(`${methods} ${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
          layer.handle.stack.forEach(l => {
            if (l.route) {
              const methods = Object.keys(l.route.methods).join(',').toUpperCase();
              routes.push(`${methods} ${l.route.path}`);
            }
          });
        }
      });
      console.log('Registered routes:\n' + routes.join('\n'));
    } catch (err) {
      console.error('Error listing routes', err);
    }
}, 500);

app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err && err.message);
  console.error('Stack:', err && err.stack);

  // Map common SQL / validation errors to friendly messages
  let status = 500;
  let message = err && err.message ? err.message : 'Internal Server Error';

  // MySQL duplicate entry
  if (err && err.code === 'ER_DUP_ENTRY') {
    status = 409;
    // extract column from message like "Duplicate entry 'x' for key 'productos.codigo_producto'" or key name
    message = 'Registro duplicado.';
    if (err.sqlMessage) {
      const m = err.sqlMessage.match(/for key '?(.*?)'?$/i);
      if (m && m[1]) {
        message = `Registro duplicado (${m[1]})`;
      }
    }
  }

  // Foreign key constraint
  if (err && (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW')) {
    status = 400;
    message = 'Dato relacionado no encontrado (clave foránea).';
  }

  // Validation errors thrown intentionally with status property
  if (err && err.status && err.message) {
    status = err.status;
    message = err.message;
  }

  res.status(status).json({ message });
});

const PORT = process.env.PORT || 3000;

async function ensureFinanceSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS costos_operativos (
      id_costo INT AUTO_INCREMENT PRIMARY KEY,
      tipo_costo VARCHAR(50) NOT NULL,
      descripcion TEXT NOT NULL,
      monto DECIMAL(10,2) NOT NULL,
      id_usuario INT NULL,
      fecha_costo TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS pagos_proveedores (
      id_pago INT AUTO_INCREMENT PRIMARY KEY,
      id_proveedor INT NOT NULL,
      id_orden_compra INT NULL,
      monto_pagado DECIMAL(10,2) NOT NULL,
      metodo_pago VARCHAR(50) NOT NULL,
      estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
      fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const ensureColumn = async (table, column, definition) => {
    const [rows] = await db.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?`,
      [table, column]
    );

    if (rows.length === 0) {
      await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  };

  const ensureColumnType = async (table, column, definition) => {
    const [rows] = await db.query(
      `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?`,
      [table, column]
    );

    if (rows.length === 0) {
      await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      return;
    }

    const currentType = rows[0].COLUMN_TYPE;
    if (!currentType || !currentType.toUpperCase().includes('VARCHAR(50)')) {
      await db.query(`ALTER TABLE ${table} MODIFY COLUMN ${column} ${definition}`);
    }
  };

  try {
    await ensureColumnType('costos_operativos', 'tipo_costo', 'VARCHAR(50) NOT NULL');
    await ensureColumn('costos_operativos', 'id_producto', 'INT NULL');
    await ensureColumn('costos_operativos', 'id_inventario', 'INT NULL');
  } catch (error) {
    console.warn('⚠️ Schema sync warning:', error.message);
  }
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function connectWithRetry({ maxAttempts = 10, delayMs = 2000 } = {}) {
  const cfg = getDatabaseConfig ? getDatabaseConfig() : {};
  console.log('Database host:', cfg.host || 'unknown', 'database:', cfg.database || 'unknown');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Attempt ${attempt} to connect to database...`);
      await db.query('SELECT 1');
      console.log('Database connection established.');
      return;
    } catch (err) {
      console.warn(`DB connect attempt ${attempt} failed: ${err && err.message}`);
      if (attempt < maxAttempts) await sleep(delayMs);
      else throw err;
    }
  }
}

(async () => {
  try {
    await connectWithRetry({ maxAttempts: Number(process.env.DB_CONNECT_RETRIES || 10), delayMs: Number(process.env.DB_CONNECT_DELAY_MS || 2000) });
    try {
      await ensureFinanceSchema();
    } catch (schemaErr) {
      console.warn('Schema initialization warning:', schemaErr && schemaErr.message);
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database after retries:', err && err.message);
    process.exit(1);
  }
})();
