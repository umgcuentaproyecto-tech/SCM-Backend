import db from '../db.js';

const productosSelect = `
  SELECT
    p.id_producto,
    p.codigo_producto,
    p.nombre_producto,
    p.descripcion,
    p.id_categoria,
    c.nombre_categoria,
    p.id_proveedor,
    prov.nombre AS proveedor_nombre,
    p.unidad_medida,
    p.precio_compra,
    p.precio_venta,
    p.precio_venta AS precio,
    p.stock_minimo,
    p.stock_maximo,
    COALESCE((
      SELECT SUM(i.stock_actual)
      FROM inventario i
      WHERE i.id_producto = p.id_producto
    ), 0) AS stock,
    p.estado
  FROM productos p
  LEFT JOIN categorias c ON c.id_categoria = p.id_categoria
  LEFT JOIN proveedores prov ON prov.id = p.id_proveedor
`;

export async function listarProductos() {
  const [rows] = await db.query(`
    ${productosSelect}
    ORDER BY p.id_producto DESC
  `);
  return rows;
}

export async function obtenerProductoPorId(id) {
  const [rows] = await db.query(
    `
      ${productosSelect}
      WHERE p.id_producto = ?
    `,
    [id]
  );
  return rows[0] || null;
}

export async function obtenerProductoPorCodigo(codigo) {
  const [rows] = await db.query('SELECT id_producto FROM productos WHERE codigo_producto = ?', [codigo]);
  return rows[0] || null;
}

export async function crearProducto(data) {
  const {
    codigo_producto,
    nombre_producto,
    descripcion = null,
    id_categoria = null,
    id_proveedor = null,
    unidad_medida = null,
    precio_compra = 0,
    precio_venta = data.precio ?? 0,
    stock_minimo = 0,
    stock_maximo = 0,
    estado = 1
  } = data;

  const [result] = await db.query(
    `INSERT INTO productos (
      codigo_producto,
      nombre_producto,
      descripcion,
      id_categoria,
      id_proveedor,
      unidad_medida,
      precio_compra,
      precio_venta,
      stock_minimo,
      stock_maximo,
      estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      codigo_producto,
      nombre_producto,
      descripcion,
      id_categoria || null,
      id_proveedor || null,
      unidad_medida,
      precio_compra,
      precio_venta,
      stock_minimo,
      stock_maximo,
      estado
    ]
  );

  return obtenerProductoPorId(result.insertId);
}

export async function actualizarProducto(id, data) {
  const {
    codigo_producto,
    nombre_producto,
    descripcion = null,
    id_categoria = null,
    id_proveedor = null,
    unidad_medida = null,
    precio_compra = 0,
    precio_venta = data.precio ?? 0,
    stock_minimo = 0,
    stock_maximo = 0,
    estado = 1
  } = data;

  const [result] = await db.query(
    `UPDATE productos SET
      codigo_producto = ?,
      nombre_producto = ?,
      descripcion = ?,
      id_categoria = ?,
      id_proveedor = ?,
      unidad_medida = ?,
      precio_compra = ?,
      precio_venta = ?,
      stock_minimo = ?,
      stock_maximo = ?,
      estado = ?
    WHERE id_producto = ?`,
    [
      codigo_producto,
      nombre_producto,
      descripcion,
      id_categoria || null,
      id_proveedor || null,
      unidad_medida,
      precio_compra,
      precio_venta,
      stock_minimo,
      stock_maximo,
      estado,
      id
    ]
  );

  if (result.affectedRows === 0) return null;
  return obtenerProductoPorId(id);
}

export async function eliminarProducto(id) {
  const [result] = await db.query('DELETE FROM productos WHERE id_producto = ?', [id]);
  return result.affectedRows;
}
