import db from '../db.js';

export async function listarCategorias() {
  const [rows] = await db.query(
    'SELECT id_categoria, nombre_categoria, descripcion, estado FROM categorias ORDER BY id_categoria DESC'
  );
  return rows;
}

export async function obtenerCategoriaPorId(id) {
  const [rows] = await db.query(
    'SELECT id_categoria, nombre_categoria, descripcion, estado FROM categorias WHERE id_categoria = ?',
    [id]
  );
  return rows[0] || null;
}

export async function crearCategoria(data) {
  const { nombre_categoria, descripcion = null, estado = 1 } = data;
  const [result] = await db.query(
    'INSERT INTO categorias (nombre_categoria, descripcion, estado) VALUES (?, ?, ?)',
    [nombre_categoria, descripcion, estado]
  );
  return obtenerCategoriaPorId(result.insertId);
}

export async function actualizarCategoria(id, data) {
  const { nombre_categoria, descripcion = null, estado = 1 } = data;
  const [result] = await db.query(
    'UPDATE categorias SET nombre_categoria = ?, descripcion = ?, estado = ? WHERE id_categoria = ?',
    [nombre_categoria, descripcion, estado, id]
  );

  if (result.affectedRows === 0) return null;

  return obtenerCategoriaPorId(id);
}

export async function eliminarCategoria(id) {
  const [result] = await db.query('DELETE FROM categorias WHERE id_categoria = ?', [id]);
  return result.affectedRows;
}
