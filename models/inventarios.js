import db from '../db.js';

export async function listarInventarios() {
  const [rows] = await db.query(`SELECT * FROM inventario ORDER BY id_inventario DESC`);
  return rows;
}

export async function obtenerInventarioPorId(id) {
  const [rows] = await db.query(`SELECT * FROM inventario WHERE id_inventario = ?`, [id]);
  return rows[0] || null;
}

export async function crearInventario(data) {
  const { id_producto, id_almacen = null, stock_actual = 0, ubicacion = null } = data;
  const fecha_actualizacion = new Date();

  const [result] = await db.query(
    `INSERT INTO inventario (id_producto, id_almacen, stock_actual, ubicacion, fecha_actualizacion) VALUES (?, ?, ?, ?, ?)`,
    [id_producto, id_almacen, stock_actual, ubicacion, fecha_actualizacion]
  );

  return obtenerInventarioPorId(result.insertId);
}

export async function actualizarInventario(id, data) {
  const { id_producto, id_almacen = null, stock_actual = 0, ubicacion = null } = data;
  const fecha_actualizacion = new Date();

  const [result] = await db.query(
    `UPDATE inventario SET id_producto = ?, id_almacen = ?, stock_actual = ?, ubicacion = ?, fecha_actualizacion = ? WHERE id_inventario = ?`,
    [id_producto, id_almacen, stock_actual, ubicacion, fecha_actualizacion, id]
  );

  if (result.affectedRows === 0) return null;

  return obtenerInventarioPorId(id);
}

export async function eliminarInventario(id) {
  const [result] = await db.query(`DELETE FROM inventario WHERE id_inventario = ?`, [id]);
  return result.affectedRows;
}

export async function listarPorProducto(id_producto) {
  const [rows] = await db.query(`SELECT * FROM inventario WHERE id_producto = ? ORDER BY id_inventario DESC`, [id_producto]);
  return rows;
}

export async function incrementarStock(id_producto, cantidad, id_almacen = null) {
  // Buscar inventario por producto y almacén
  const [rows] = await db.query(`SELECT * FROM inventario WHERE id_producto = ? AND (id_almacen = ? OR (? IS NULL AND id_almacen IS NULL)) LIMIT 1`, [id_producto, id_almacen, id_almacen]);
  if (rows.length > 0) {
    const inv = rows[0];
    const nuevoStock = Number(inv.stock_actual) + Number(cantidad);
    const fecha_actualizacion = new Date();
    await db.query(`UPDATE inventario SET stock_actual = ?, fecha_actualizacion = ? WHERE id_inventario = ?`, [nuevoStock, fecha_actualizacion, inv.id_inventario]);
    return await obtenerInventarioPorId(inv.id_inventario);
  } else {
    // crear nuevo registro de inventario
    return await crearInventario({ id_producto, id_almacen, stock_actual: cantidad, ubicacion: null });
  }
}
