import db from '../db.js';

export async function listarRutas() {
  const [rows] = await db.query(
    'SELECT id_ruta, nombre_ruta, origen, destino, distancia_km, tiempo_estimado, costo_base, estado FROM rutas ORDER BY id_ruta DESC'
  );
  return rows;
}

export async function obtenerRutaPorId(id) {
  const [rows] = await db.query(
    'SELECT id_ruta, nombre_ruta, origen, destino, distancia_km, tiempo_estimado, costo_base, estado FROM rutas WHERE id_ruta = ?',
    [id]
  );
  return rows[0] || null;
}

export async function crearRuta(data) {
  const { nombre_ruta, origen, destino, distancia_km = null, tiempo_estimado = null, costo_base = null, estado = 1 } = data;
  const [result] = await db.query(
    'INSERT INTO rutas (nombre_ruta, origen, destino, distancia_km, tiempo_estimado, costo_base, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nombre_ruta, origen, destino, distancia_km, tiempo_estimado, costo_base, estado]
  );
  return obtenerRutaPorId(result.insertId);
}

export async function actualizarRuta(id, data) {
  const { nombre_ruta, origen, destino, distancia_km = null, tiempo_estimado = null, costo_base = null, estado = 1 } = data;
  const [result] = await db.query(
    'UPDATE rutas SET nombre_ruta = ?, origen = ?, destino = ?, distancia_km = ?, tiempo_estimado = ?, costo_base = ?, estado = ? WHERE id_ruta = ?',
    [nombre_ruta, origen, destino, distancia_km, tiempo_estimado, costo_base, estado, id]
  );
  if (result.affectedRows === 0) return null;
  return obtenerRutaPorId(id);
}

export async function eliminarRuta(id) {
  const [result] = await db.query('DELETE FROM rutas WHERE id_ruta = ?', [id]);
  return result.affectedRows;
}
