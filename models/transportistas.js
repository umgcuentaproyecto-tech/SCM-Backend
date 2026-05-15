import db from '../db.js';

export async function listarTransportistas() {
  const [rows] = await db.query(
    'SELECT id_transportista, nombre_transportista, telefono, correo, tipo, estado FROM transportistas ORDER BY id_transportista DESC'
  );
  return rows;
}

export async function obtenerTransportistaPorId(id) {
  const [rows] = await db.query(
    'SELECT id_transportista, nombre_transportista, telefono, correo, tipo, estado FROM transportistas WHERE id_transportista = ?',
    [id]
  );
  return rows[0] || null;
}

export async function crearTransportista(data) {
  const { nombre_transportista, telefono = null, correo = null, tipo = 'EXTERNO', estado = 1 } = data;
  const [result] = await db.query(
    'INSERT INTO transportistas (nombre_transportista, telefono, correo, tipo, estado) VALUES (?, ?, ?, ?, ?)',
    [nombre_transportista, telefono, correo, tipo, estado]
  );
  return obtenerTransportistaPorId(result.insertId);
}

export async function actualizarTransportista(id, data) {
  const { nombre_transportista, telefono = null, correo = null, tipo = 'EXTERNO', estado = 1 } = data;
  const [result] = await db.query(
    'UPDATE transportistas SET nombre_transportista = ?, telefono = ?, correo = ?, tipo = ?, estado = ? WHERE id_transportista = ?',
    [nombre_transportista, telefono, correo, tipo, estado, id]
  );
  if (result.affectedRows === 0) return null;
  return obtenerTransportistaPorId(id);
}

export async function eliminarTransportista(id) {
  const [result] = await db.query('DELETE FROM transportistas WHERE id_transportista = ?', [id]);
  return result.affectedRows;
}
