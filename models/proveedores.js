import pool from '../db.js';

export const obtenerProveedores = async () => {
  const [rows] = await pool.query('SELECT * FROM proveedores ORDER BY id DESC');
  return rows;
};

export const buscarProveedoresPorNombre = async (term) => {
  const q = `%${term}%`;
  const [rows] = await pool.query('SELECT * FROM proveedores WHERE nombre LIKE ? ORDER BY id DESC LIMIT 20', [q]);
  return rows;
};

export const crearProveedor = async (proveedor) => {
  const { nombre, telefono, correo, direccion } = proveedor;
  const [result] = await pool.query(
    'INSERT INTO proveedores (nombre, telefono, correo, direccion) VALUES (?, ?, ?, ?)',
    [nombre, telefono, correo, direccion]
  );
  return result;
};

export const obtenerProveedorPorId = async (id) => {
  const [rows] = await pool.query('SELECT * FROM proveedores WHERE id = ?', [id]);
  return rows[0] || null;
};

export const actualizarProveedor = async (id, proveedor) => {
  const { nombre, telefono, correo, direccion } = proveedor;
  const [result] = await pool.query(
    'UPDATE proveedores SET nombre = ?, telefono = ?, correo = ?, direccion = ? WHERE id = ?',
    [nombre, telefono, correo, direccion, id]
  );
  return result;
};

export const eliminarProveedor = async (id) => {
  const [result] = await pool.query('DELETE FROM proveedores WHERE id = ?', [id]);
  return result;
};
