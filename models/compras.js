import pool from '../db.js';

export const obtenerCompras = async () => {
  const [rows] = await pool.query('SELECT * FROM compras ORDER BY id DESC');
  return rows;
};

export const crearCompra = async (compra) => {
  const { producto, cantidad, total, fecha } = compra;
  const [result] = await pool.query(
    'INSERT INTO compras (producto, cantidad, total, fecha) VALUES (?, ?, ?, ?)',
    [producto, cantidad, total, fecha]
  );
  return result;
};

export const eliminarCompra = async (id) => {
  const [result] = await pool.query('DELETE FROM compras WHERE id = ?', [id]);
  return result;
};
