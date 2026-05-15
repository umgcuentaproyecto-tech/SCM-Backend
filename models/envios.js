import db from '../db.js';

const fields = `
  e.id_envio, e.id_pedido, e.id_transportista, e.id_vehiculo, e.id_ruta,
  e.direccion_entrega, e.fecha_salida, e.fecha_entrega, e.estado, e.costo_envio,
  gp.total AS pedido_total,
  gp.estado AS pedido_estado,
  c.nombre AS pedido_cliente,
  t.nombre_transportista,
  v.placa, v.marca, v.modelo,
  r.nombre_ruta, r.origen, r.destino,
  (
    SELECT GROUP_CONCAT(CONCAT(pr.nombre_producto, ' x', d.cantidad) SEPARATOR ', ')
    FROM pedido_detalles d
    LEFT JOIN productos pr ON pr.id_producto = d.id_producto
    WHERE d.id_pedido = e.id_pedido
  ) AS pedido_productos
`;
const join = `
  FROM envios e
  LEFT JOIN gestion_pedidos gp ON gp.id_pedido = e.id_pedido
  LEFT JOIN clientes c ON c.id_cliente = gp.id_cliente
  LEFT JOIN transportistas t ON t.id_transportista = e.id_transportista
  LEFT JOIN vehiculos v ON v.id_vehiculo = e.id_vehiculo
  LEFT JOIN rutas r ON r.id_ruta = e.id_ruta
`;

export async function listarEnvios() {
  const [rows] = await db.query(`SELECT ${fields} ${join} ORDER BY e.id_envio DESC`);
  return rows;
}

export async function obtenerEnvioPorId(id) {
  const [rows] = await db.query(`SELECT ${fields} ${join} WHERE e.id_envio = ?`, [id]);
  return rows[0] || null;
}

export async function obtenerEnvioPorPedido(id_pedido) {
  if (id_pedido == null) return null;
  const [rows] = await db.query('SELECT id_envio FROM envios WHERE id_pedido = ?', [id_pedido]);
  return rows[0] || null;
}

export async function crearEnvio(data) {
  const {
    id_pedido = null, id_transportista = null, id_vehiculo = null, id_ruta = null,
    direccion_entrega, fecha_salida = null, fecha_entrega = null,
    estado = 'PENDIENTE', costo_envio = null
  } = data;

  if (id_pedido) {
    const existing = await obtenerEnvioPorPedido(id_pedido);
    if (existing) {
      const error = new Error('Este pedido ya tiene un envío asignado');
      error.status = 400;
      throw error;
    }
  }

  const [result] = await db.query(
    `INSERT INTO envios
      (id_pedido, id_transportista, id_vehiculo, id_ruta, direccion_entrega, fecha_salida, fecha_entrega, estado, costo_envio)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id_pedido, id_transportista, id_vehiculo, id_ruta, direccion_entrega, fecha_salida, fecha_entrega, estado, costo_envio]
  );
  return obtenerEnvioPorId(result.insertId);
}

export async function actualizarEnvio(id, data) {
  const {
    id_pedido = null, id_transportista = null, id_vehiculo = null, id_ruta = null,
    direccion_entrega, fecha_salida = null, fecha_entrega = null,
    estado = 'PENDIENTE', costo_envio = null
  } = data;

  if (id_pedido) {
    const existing = await obtenerEnvioPorPedido(id_pedido);
    if (existing && String(existing.id_envio) !== String(id)) {
      const error = new Error('Este pedido ya tiene un envío asignado');
      error.status = 400;
      throw error;
    }
  }

  const [result] = await db.query(
    `UPDATE envios SET
      id_pedido = ?, id_transportista = ?, id_vehiculo = ?, id_ruta = ?,
      direccion_entrega = ?, fecha_salida = ?, fecha_entrega = ?, estado = ?, costo_envio = ?
     WHERE id_envio = ?`,
    [id_pedido, id_transportista, id_vehiculo, id_ruta, direccion_entrega, fecha_salida, fecha_entrega, estado, costo_envio, id]
  );
  if (result.affectedRows === 0) return null;
  return obtenerEnvioPorId(id);
}

export async function eliminarEnvio(id) {
  const [result] = await db.query('DELETE FROM envios WHERE id_envio = ?', [id]);
  return result.affectedRows;
}
