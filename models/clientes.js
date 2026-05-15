import db from '../db.js';

export async function listarClientes() {
  const [rows] = await db.query(
    'SELECT id_cliente, nombre, correo, telefono, direccion, estado, fecha_creacion FROM clientes ORDER BY id_cliente DESC'
  );
  return rows;
}

export async function obtenerClientePorId(id) {
  const [rows] = await db.query(
    'SELECT id_cliente, nombre, correo, telefono, direccion, estado, fecha_creacion FROM clientes WHERE id_cliente = ?',
    [id]
  );
  return rows[0] || null;
}

export async function crearCliente(data) {
  const { nombre, correo, telefono = null, direccion = null, estado = 1 } = data;
  const [result] = await db.query(
    'INSERT INTO clientes (nombre, correo, telefono, direccion, estado) VALUES (?, ?, ?, ?, ?)',
    [nombre, correo, telefono, direccion, estado]
  );
  return obtenerClientePorId(result.insertId);
}

export async function actualizarCliente(id, data) {
  const { nombre, correo, telefono = null, direccion = null, estado = 1 } = data;
  const [result] = await db.query(
    'UPDATE clientes SET nombre = ?, correo = ?, telefono = ?, direccion = ?, estado = ? WHERE id_cliente = ?',
    [nombre, correo, telefono, direccion, estado, id]
  );
  if (result.affectedRows === 0) return null;
  return obtenerClientePorId(id);
}

export async function eliminarCliente(id) {
  const [result] = await db.query('DELETE FROM clientes WHERE id_cliente = ?', [id]);
  return result.affectedRows;
}
