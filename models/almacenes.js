import db from '../db.js';

export async function listarAlmacenes() {
  try {
    const [rows] = await db.query(
      'SELECT id_almacen, nombre_almacen, direccion, encargado, telefono, estado FROM almacenes ORDER BY id_almacen DESC'
    );
    return rows;
  } catch (err) {
    // If the table doesn't exist, return empty list to avoid crashing the API
    if (err && (err.code === 'ER_NO_SUCH_TABLE' || (err.message && err.message.includes("doesn't exist")))) {
      return [];
    }
    throw err;
  }
}

export async function obtenerAlmacenPorId(id) {
  const [rows] = await db.query(
    'SELECT id_almacen, nombre_almacen, direccion, encargado, telefono, estado FROM almacenes WHERE id_almacen = ?',
    [id]
  );
  return rows[0] || null;
}

export async function crearAlmacen(data) {
  const { nombre_almacen, direccion = null, encargado = null, telefono = null, estado = 1 } = data;
  const [result] = await db.query(
    'INSERT INTO almacenes (nombre_almacen, direccion, encargado, telefono, estado) VALUES (?, ?, ?, ?, ?)',
    [nombre_almacen, direccion, encargado, telefono, estado]
  );
  return obtenerAlmacenPorId(result.insertId);
}

export async function actualizarAlmacen(id, data) {
  const { nombre_almacen, direccion = null, encargado = null, telefono = null, estado = 1 } = data;
  const [result] = await db.query(
    'UPDATE almacenes SET nombre_almacen = ?, direccion = ?, encargado = ?, telefono = ?, estado = ? WHERE id_almacen = ?',
    [nombre_almacen, direccion, encargado, telefono, estado, id]
  );
  if (result.affectedRows === 0) return null;
  return obtenerAlmacenPorId(id);
}

export async function eliminarAlmacen(id) {
  const [result] = await db.query('DELETE FROM almacenes WHERE id_almacen = ?', [id]);
  return result.affectedRows;
}
