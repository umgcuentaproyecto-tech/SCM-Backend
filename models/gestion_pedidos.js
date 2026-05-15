import db from '../db.js';

export async function listarPedidos() {
  const [rows] = await db.query(
    `SELECT p.id_pedido, c.nombre AS cliente, p.total, p.estado, p.fecha_creacion, p.fecha_actualizacion
     FROM gestion_pedidos p
     LEFT JOIN clientes c ON c.id_cliente = p.id_cliente
     ORDER BY p.id_pedido DESC`
  );
  return rows;
}

export async function obtenerPedidoPorId(id) {
  const [orders] = await db.query(
    `SELECT p.id_pedido, p.id_cliente, c.nombre AS cliente, p.total, p.estado, p.fecha_creacion, p.fecha_actualizacion
     FROM gestion_pedidos p
     LEFT JOIN clientes c ON c.id_cliente = p.id_cliente
     WHERE p.id_pedido = ?`,
    [id]
  );

  const pedido = orders[0] || null;
  if (!pedido) return null;

  const [items] = await db.query(
    `SELECT d.id_detalle, d.id_producto, pr.nombre_producto, d.cantidad, d.precio_unitario, d.total_item
     FROM pedido_detalles d
     LEFT JOIN productos pr ON pr.id_producto = d.id_producto
     WHERE d.id_pedido = ?`,
    [id]
  );

  pedido.items = items;
  return pedido;
}

export async function crearPedido(data) {
  const { id_cliente, items = [], estado = 'pendiente' } = data;
  if (!id_cliente || !Array.isArray(items) || items.length === 0) {
    throw new Error('id_cliente and items are required');
  }

  const estadoNormalizado = String(estado || 'pendiente').toLowerCase();
  if (!['pendiente', 'confirmado'].includes(estadoNormalizado)) {
    throw new Error('Estado de pedido inválido');
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let total = 0;
    for (const item of items) {
      if (!item.id_producto || !item.cantidad || item.cantidad <= 0) {
        throw new Error('Cada item debe tener id_producto y cantidad mayor a 0');
      }

      const [productRows] = await connection.query(
        `SELECT
          p.id_producto,
          p.precio_venta AS precio,
          COALESCE((
            SELECT SUM(i.stock_actual)
            FROM inventario i
            WHERE i.id_producto = p.id_producto
          ), 0) AS stock
        FROM productos p
        WHERE p.id_producto = ?
        FOR UPDATE`,
        [item.id_producto]
      );
      const producto = productRows[0];
      if (!producto) {
        throw new Error(`Producto no encontrado: ${item.id_producto}`);
      }
      if (producto.stock < item.cantidad) {
        throw new Error(`No hay stock suficiente para ${item.id_producto}`);
      }

      total += Number(producto.precio) * item.cantidad;
    }

    const [orderResult] = await connection.query(
      'INSERT INTO gestion_pedidos (id_cliente, total, estado) VALUES (?, ?, ?)',
      [id_cliente, total, estadoNormalizado]
    );

    const orderId = orderResult.insertId;
    for (const item of items) {
      const [productRows] = await connection.query(
        'SELECT precio_venta AS precio FROM productos WHERE id_producto = ? FOR UPDATE',
        [item.id_producto]
      );
      const precioUnitario = productRows[0].precio;
      const itemTotal = precioUnitario * item.cantidad;

      await connection.query(
        'INSERT INTO pedido_detalles (id_pedido, id_producto, cantidad, precio_unitario, total_item) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id_producto, item.cantidad, precioUnitario, itemTotal]
      );
    }

    if (estadoNormalizado === 'confirmado') {
      for (const item of items) {
        await descontarInventario(connection, item.id_producto, item.cantidad);
      }
    }

    await connection.commit();
    return obtenerPedidoPorId(orderId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function obtenerPedidoConItemsEnConexion(connection, id) {
  const [orders] = await connection.query(
    `SELECT p.id_pedido, p.id_cliente, c.nombre AS cliente, p.total, p.estado, p.fecha_creacion, p.fecha_actualizacion
     FROM gestion_pedidos p
     LEFT JOIN clientes c ON c.id_cliente = p.id_cliente
     WHERE p.id_pedido = ?`,
    [id]
  );

  const pedido = orders[0] || null;
  if (!pedido) return null;

  const [items] = await connection.query(
    `SELECT d.id_detalle, d.id_producto, pr.nombre_producto, d.cantidad, d.precio_unitario, d.total_item
     FROM pedido_detalles d
     LEFT JOIN productos pr ON pr.id_producto = d.id_producto
     WHERE d.id_pedido = ?`,
    [id]
  );

  pedido.items = items;
  return pedido;
}

export async function actualizarPedido(id, data) {
  const { id_cliente, items = [], estado = 'pendiente' } = data;
  if (!id_cliente || !Array.isArray(items) || items.length === 0) {
    throw new Error('id_cliente and items are required');
  }

  const estadoNormalizado = String(estado || 'pendiente').toLowerCase();
  if (!['pendiente', 'confirmado'].includes(estadoNormalizado)) {
    throw new Error('Estado de pedido inválido');
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const pedidoActual = await obtenerPedidoConItemsEnConexion(connection, id);
    if (!pedidoActual) {
      await connection.rollback();
      return null;
    }

    const wasConfirmed = String(pedidoActual.estado || 'pendiente').toLowerCase() === 'confirmado';
    const willBeConfirmed = estadoNormalizado === 'confirmado';

    if (wasConfirmed) {
      for (const item of pedidoActual.items) {
        await devolverInventario(connection, item.id_producto, item.cantidad);
      }
    }

    const preciosPorProducto = new Map();
    let total = 0;

    for (const item of items) {
      if (!item.id_producto || !item.cantidad || item.cantidad <= 0) {
        throw new Error('Cada item debe tener id_producto y cantidad mayor a 0');
      }

      const [productRows] = await connection.query(
        `SELECT
          p.id_producto,
          p.precio_venta AS precio,
          COALESCE((
            SELECT SUM(i.stock_actual)
            FROM inventario i
            WHERE i.id_producto = p.id_producto
          ), 0) AS stock
        FROM productos p
        WHERE p.id_producto = ?
        FOR UPDATE`,
        [item.id_producto]
      );

      const producto = productRows[0];
      if (!producto) {
        throw new Error(`Producto no encontrado: ${item.id_producto}`);
      }
      if (producto.stock < item.cantidad) {
        throw new Error(`No hay stock suficiente para ${item.id_producto}`);
      }

      preciosPorProducto.set(Number(item.id_producto), Number(producto.precio));
      total += Number(producto.precio) * item.cantidad;
    }

    await connection.query(
      'UPDATE gestion_pedidos SET id_cliente = ?, total = ?, estado = ? WHERE id_pedido = ?',
      [id_cliente, total, estadoNormalizado, id]
    );

    await connection.query('DELETE FROM pedido_detalles WHERE id_pedido = ?', [id]);

    for (const item of items) {
      const precioUnitario = preciosPorProducto.get(Number(item.id_producto)) || 0;
      const itemTotal = precioUnitario * item.cantidad;

      await connection.query(
        'INSERT INTO pedido_detalles (id_pedido, id_producto, cantidad, precio_unitario, total_item) VALUES (?, ?, ?, ?, ?)',
        [id, item.id_producto, item.cantidad, precioUnitario, itemTotal]
      );
    }

    if (willBeConfirmed) {
      for (const item of items) {
        await descontarInventario(connection, item.id_producto, item.cantidad);
      }
    }

    await connection.commit();
    return obtenerPedidoPorId(id);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function actualizarEstadoPedido(id, estado) {
  const estadoNormalizado = String(estado || '').toLowerCase();
  if (!['pendiente', 'confirmado'].includes(estadoNormalizado)) {
    throw new Error('Estado de pedido inválido');
  }

  const pedido = await obtenerPedidoPorId(id);
  if (!pedido) return null;

  const currentEstado = String(pedido.estado || 'pendiente').toLowerCase();
  if (currentEstado === estadoNormalizado) return pedido;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    if (currentEstado === 'pendiente' && estadoNormalizado === 'confirmado') {
      for (const item of pedido.items) {
        const [productRows] = await connection.query(
          `SELECT
            p.id_producto,
            COALESCE((
              SELECT SUM(i.stock_actual)
              FROM inventario i
              WHERE i.id_producto = p.id_producto
            ), 0) AS stock
          FROM productos p
          WHERE p.id_producto = ?
          FOR UPDATE`,
          [item.id_producto]
        );

        const producto = productRows[0];
        if (!producto) {
          throw new Error(`Producto no encontrado: ${item.id_producto}`);
        }
        if (producto.stock < item.cantidad) {
          throw new Error(`No hay stock suficiente para ${item.id_producto}`);
        }
      }

      for (const item of pedido.items) {
        await descontarInventario(connection, item.id_producto, item.cantidad);
      }
    } else if (currentEstado === 'confirmado' && estadoNormalizado === 'pendiente') {
      for (const item of pedido.items) {
        await devolverInventario(connection, item.id_producto, item.cantidad);
      }
    }

    await connection.query('UPDATE gestion_pedidos SET estado = ? WHERE id_pedido = ?', [estadoNormalizado, id]);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  return obtenerPedidoPorId(id);
}

async function descontarInventario(connection, idProducto, cantidad) {
  let pendiente = cantidad;
  const [inventarios] = await connection.query(
    `SELECT id_inventario, stock_actual
     FROM inventario
     WHERE id_producto = ? AND stock_actual > 0
     ORDER BY id_inventario ASC
     FOR UPDATE`,
    [idProducto]
  );

  for (const inventario of inventarios) {
    if (pendiente <= 0) break;

    const descuento = Math.min(Number(inventario.stock_actual), pendiente);
    await connection.query(
      `UPDATE inventario
       SET stock_actual = stock_actual - ?, fecha_actualizacion = NOW()
       WHERE id_inventario = ?`,
      [descuento, inventario.id_inventario]
    );
    pendiente -= descuento;
  }

  if (pendiente > 0) {
    throw new Error(`No hay stock suficiente para ${idProducto}`);
  }
}

async function devolverInventario(connection, idProducto, cantidad) {
  const [inventarios] = await connection.query(
    `SELECT id_inventario
     FROM inventario
     WHERE id_producto = ?
     ORDER BY id_inventario ASC
     LIMIT 1
     FOR UPDATE`,
    [idProducto]
  );

  if (inventarios[0]) {
    await connection.query(
      `UPDATE inventario
       SET stock_actual = stock_actual + ?, fecha_actualizacion = NOW()
       WHERE id_inventario = ?`,
      [cantidad, inventarios[0].id_inventario]
    );
    return;
  }

  await connection.query(
    `INSERT INTO inventario (id_producto, stock_actual, fecha_actualizacion)
     VALUES (?, ?, NOW())`,
    [idProducto, cantidad]
  );
}

export async function eliminarPedido(id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    // Restaurar inventario antes de eliminar el pedido
    const [items] = await connection.query(
      'SELECT id_producto, cantidad FROM pedido_detalles WHERE id_pedido = ?',
      [id]
    );
    for (const item of items) {
      await devolverInventario(connection, item.id_producto, item.cantidad);
    }

    await connection.query('DELETE FROM pedido_detalles WHERE id_pedido = ?', [id]);
    const [result] = await connection.query('DELETE FROM gestion_pedidos WHERE id_pedido = ?', [id]);
    await connection.commit();
    return result.affectedRows;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
