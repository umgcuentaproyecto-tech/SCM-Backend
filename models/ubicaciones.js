import db from '../db.js';

const fields = `
  u.id_ubicacion, u.id_almacen, u.pasillo, u.estante, u.nivel, u.descripcion,
  a.nombre_almacen
`;
const join = `FROM ubicaciones_almacen u LEFT JOIN almacenes a ON a.id_almacen = u.id_almacen`;

export async function listarUbicaciones() {
  try {
    const [rows] = await db.query(`SELECT ${fields} ${join} ORDER BY u.id_ubicacion DESC`);
    return rows;
  } catch (err) {
    if (err && (err.code === 'ER_NO_SUCH_TABLE' || (err.message && err.message.includes("doesn't exist")))) {
      return [];
    }
    throw err;
  }
}

export async function listarUbicacionesPorAlmacen(id_almacen) {
  const [rows] = await db.query(
    `SELECT ${fields} ${join} WHERE u.id_almacen = ? ORDER BY u.id_ubicacion DESC`,
    [id_almacen]
  );
  return rows;
}

export async function obtenerUbicacionPorId(id) {
  const [rows] = await db.query(
    `SELECT ${fields} ${join} WHERE u.id_ubicacion = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function crearUbicacion(data) {
  const { id_almacen, pasillo = null, estante = null, nivel = null, descripcion = null } = data;
  const [result] = await db.query(
    'INSERT INTO ubicaciones_almacen (id_almacen, pasillo, estante, nivel, descripcion) VALUES (?, ?, ?, ?, ?)',
    [id_almacen, pasillo, estante, nivel, descripcion]
  );
  return obtenerUbicacionPorId(result.insertId);
}

export async function actualizarUbicacion(id, data) {
  const { id_almacen, pasillo = null, estante = null, nivel = null, descripcion = null } = data;
  const [result] = await db.query(
    'UPDATE ubicaciones_almacen SET id_almacen = ?, pasillo = ?, estante = ?, nivel = ?, descripcion = ? WHERE id_ubicacion = ?',
    [id_almacen, pasillo, estante, nivel, descripcion, id]
  );
  if (result.affectedRows === 0) return null;
  return obtenerUbicacionPorId(id);
}

export async function eliminarUbicacion(id) {
  const [result] = await db.query('DELETE FROM ubicaciones_almacen WHERE id_ubicacion = ?', [id]);
  return result.affectedRows;
}
