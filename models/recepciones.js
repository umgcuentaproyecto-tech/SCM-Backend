import pool from '../db.js';

export const obtenerRecepciones = async () => {
  const [rows] = await pool.query('SELECT * FROM recepciones ORDER BY id DESC');
  return rows;
};

export const crearRecepcion = async (recepcion) => {
  const { orden_id, fecha_recepcion, estado, id_almacen = null } = recepcion;
  const [result] = await pool.query(
    'INSERT INTO recepciones (orden_id, fecha_recepcion, estado, id_almacen) VALUES (?, ?, ?, ?)',
    [orden_id, fecha_recepcion, estado, id_almacen]
  );
  return result;
};

export const eliminarRecepcion = async (id) => {
  const [result] = await pool.query('DELETE FROM recepciones WHERE id = ?', [id]);
  return result;
};

export const obtenerRecepcionPorId = async (id) => {
  const [rows] = await pool.query('SELECT * FROM recepciones WHERE id = ?', [id]);
  return rows[0];
};

export const actualizarRecepcion = async (id, cambios) => {
  const fields = Object.keys(cambios);
  if (fields.length === 0) return null;
  const sets = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => cambios[f]);
  values.push(id);
  const [result] = await pool.query(`UPDATE recepciones SET ${sets} WHERE id = ?`, values);
  return result;
};
