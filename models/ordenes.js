import pool from '../db.js';

export const obtenerOrdenes = async () => {
  const [rows] = await pool.query('SELECT * FROM ordenes_compra ORDER BY id DESC');
  return rows;
};

export const crearOrden = async (orden) => {
  const { proveedor = null, id_proveedor = null, fecha, total } = orden;
  try {
    const [result] = await pool.query(
      'INSERT INTO ordenes_compra (proveedor, id_proveedor, fecha, total) VALUES (?, ?, ?, ?)',
      [proveedor, id_proveedor, fecha, total]
    );
    return { insertId: result.insertId, result };
  } catch (err) {
    // Si la columna id_proveedor no existe en la BD, reintentar sin ese campo
    if (err && err.message && err.message.includes("Unknown column 'id_proveedor'")) {
      const [result] = await pool.query(
        'INSERT INTO ordenes_compra (proveedor, fecha, total) VALUES (?, ?, ?)',
        [proveedor, fecha, total]
      );
      return { insertId: result.insertId, result };
    }
    throw err;
  }
};

export const eliminarOrden = async (id) => {
  const [result] = await pool.query('DELETE FROM ordenes_compra WHERE id = ?', [id]);
  return result;
};

export const autorizarOrden = async (id, autorizada = 1) => {
  const [result] = await pool.query(
    'UPDATE ordenes_compra SET autorizada = ? WHERE id = ?',
    [autorizada, id]
  );
  return result;
};

export const obtenerOrdenPorId = async (id) => {
  const [rows] = await pool.query('SELECT * FROM ordenes_compra WHERE id = ?', [id]);
  return rows[0];
};

export const actualizarEstadoOrden = async (id, cambios) => {
  const fields = Object.keys(cambios);
  if (fields.length === 0) return null;
  const sets = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => cambios[f]);
  values.push(id);
  const [result] = await pool.query(`UPDATE ordenes_compra SET ${sets} WHERE id = ?`, values);
  return result;
};

export const crearLineaOrden = async (orden_id, linea) => {
  const { id_producto, cantidad, precio_unitario, total_item } = linea;
  const [result] = await pool.query(
    'INSERT INTO ordenes_compra_detalles (orden_id, id_producto, cantidad, precio_unitario, total_item) VALUES (?, ?, ?, ?, ?)',
    [orden_id, id_producto, cantidad, precio_unitario, total_item]
  );
  return result;
};

export const obtenerLineasPorOrden = async (orden_id) => {
  const [rows] = await pool.query('SELECT * FROM ordenes_compra_detalles WHERE orden_id = ?', [orden_id]);
  return rows;
};
