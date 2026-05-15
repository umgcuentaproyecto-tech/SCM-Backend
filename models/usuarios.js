import bcrypt from 'bcryptjs';
import db from '../db.js';

const userFields = `
  u.id_usuario,
  u.nombre,
  u.correo,
  u.id_rol,
  u.telefono,
  u.estado,
  u.fecha_creacion,
  r.nombre_rol AS role_name
`;

const userJoin = `
  FROM usuarios u
  LEFT JOIN roles r ON r.id_rol = u.id_rol
`;

export async function listarUsuarios() {
  const [rows] = await db.query(`SELECT ${userFields} ${userJoin} ORDER BY u.id_usuario DESC LIMIT 100`);
  return rows;
}

export async function obtenerUsuarioPorId(id) {
  const [rows] = await db.query(`SELECT ${userFields} ${userJoin} WHERE u.id_usuario = ?`, [id]);
  return rows[0] || null;
}

export async function obtenerUsuarioPorCorreo(correo) {
  const [rows] = await db.query(`SELECT u.id_usuario, u.nombre, u.correo, u.password, u.id_rol, u.telefono, u.estado, r.nombre_rol AS role_name FROM usuarios u LEFT JOIN roles r ON r.id_rol = u.id_rol WHERE u.correo = ?`, [correo]);
  return rows[0] || null;
}

export async function crearUsuario(data) {
  const { nombre, correo, password, id_rol = null, telefono = null, estado = 1 } = data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    'INSERT INTO usuarios (nombre, correo, password, id_rol, telefono, estado) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, correo, hashedPassword, id_rol, telefono, estado]
  );

  return obtenerUsuarioPorId(result.insertId);
}

export async function actualizarUsuario(id, data) {
  const { nombre, correo, password, id_rol = null, telefono = null, estado = 1 } = data;

  const values = [nombre, correo, id_rol, telefono, estado];
  let sql = 'UPDATE usuarios SET nombre = ?, correo = ?, id_rol = ?, telefono = ?, estado = ?';

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    sql += ', password = ?';
    values.push(hashedPassword);
  }

  sql += ' WHERE id_usuario = ?';
  values.push(id);

  const [result] = await db.query(sql, values);
  if (result.affectedRows === 0) {
    return null;
  }

  return obtenerUsuarioPorId(id);
}

export async function eliminarUsuario(id) {
  const [result] = await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
  return result.affectedRows;
}
