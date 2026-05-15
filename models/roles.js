import db from "../db.js";

export async function listarRoles() {
  const [rows] = await db.query("SELECT id_rol, nombre_rol, descripcion, estado FROM roles ORDER BY id_rol DESC");
  return rows;
}

export async function obtenerRolPorId(id) {
  const [rows] = await db.query("SELECT id_rol, nombre_rol, descripcion, estado FROM roles WHERE id_rol = ?", [id]);
  return rows[0] || null;
}

export async function crearRol(data) {
  const { nombre_rol, descripcion = null, estado = 1 } = data;
  const [result] = await db.query(
    "INSERT INTO roles (nombre_rol, descripcion, estado) VALUES (?, ?, ?)",
    [nombre_rol, descripcion, estado]
  );
  return obtenerRolPorId(result.insertId);
}

export async function actualizarRol(id, data) {
  const { nombre_rol, descripcion = null, estado = 1 } = data;
  const [result] = await db.query(
    "UPDATE roles SET nombre_rol = ?, descripcion = ?, estado = ? WHERE id_rol = ?",
    [nombre_rol, descripcion, estado, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return obtenerRolPorId(id);
}

export async function eliminarRol(id) {
  const [result] = await db.query("DELETE FROM roles WHERE id_rol = ?", [id]);
  return result.affectedRows;
}
