import db from '../db.js';
import { isIntegerValue, isNumberValue, isPositiveNumber } from '../utils/validators.js';

export const getCostos = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.*,
        u.nombre AS usuario_nombre,
        p.nombre_producto,
        COALESCE(i.stock_actual, 0) AS stock_actual
      FROM costos_operativos c
      LEFT JOIN usuarios u ON u.id_usuario = c.id_usuario
      LEFT JOIN productos p ON p.id_producto = c.id_producto
      LEFT JOIN (
        SELECT id_producto, SUM(stock_actual) AS stock_actual
        FROM inventario
        GROUP BY id_producto
      ) i ON i.id_producto = c.id_producto
      ORDER BY c.fecha_costo DESC, c.id_costo DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createCosto = async (req, res, next) => {
  try {
    const {
      tipo_costo,
      descripcion,
      monto,
      id_usuario = null,
      id_producto = null,
      id_inventario = null
    } = req.body;

    if (!tipo_costo || !descripcion) {
      return res.status(400).json({ error: 'Tipo y descripción son obligatorios' });
    }
    if (!isPositiveNumber(monto)) {
      return res.status(400).json({ error: 'Monto debe ser un número mayor a 0' });
    }
    if (id_usuario !== null && id_usuario !== '' && !isIntegerValue(id_usuario)) {
      return res.status(400).json({ error: 'id_usuario debe ser un número entero válido' });
    }
    if (id_producto !== null && id_producto !== '' && !isIntegerValue(id_producto)) {
      return res.status(400).json({ error: 'id_producto debe ser un número entero válido' });
    }
    if (id_inventario !== null && id_inventario !== '' && !isIntegerValue(id_inventario)) {
      return res.status(400).json({ error: 'id_inventario debe ser un número entero válido' });
    }

    const [result] = await db.query(
      `INSERT INTO costos_operativos
       (tipo_costo, descripcion, monto, id_usuario, id_producto, id_inventario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tipo_costo,
        descripcion,
        Number(monto),
        id_usuario || null,
        id_producto || null,
        id_inventario || null
      ]
    );

    res.status(201).json({ message: 'Costo registrado', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const updateCosto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      tipo_costo,
      descripcion,
      monto,
      id_producto = null,
      id_inventario = null
    } = req.body;
    if (!tipo_costo || !descripcion) {
      return res.status(400).json({ error: 'Tipo y descripción son obligatorios' });
    }
    if (!isPositiveNumber(monto)) {
      return res.status(400).json({ error: 'Monto debe ser un número mayor a 0' });
    }
    if (id_producto !== null && id_producto !== '' && !isIntegerValue(id_producto)) {
      return res.status(400).json({ error: 'id_producto debe ser un número entero válido' });
    }
    if (id_inventario !== null && id_inventario !== '' && !isIntegerValue(id_inventario)) {
      return res.status(400).json({ error: 'id_inventario debe ser un número entero válido' });
    }

    await db.query(
      `UPDATE costos_operativos
       SET tipo_costo = ?, descripcion = ?, monto = ?, id_producto = ?, id_inventario = ?
       WHERE id_costo = ?`,
      [tipo_costo, descripcion, Number(monto), id_producto || null, id_inventario || null, id]
    );

    res.json({ message: 'Costo actualizado' });
  } catch (error) {
    next(error);
  }
};

export const deleteCosto = async (req, res, next) => {
  try {
    await db.query('DELETE FROM costos_operativos WHERE id_costo = ?', [req.params.id]);
    res.json({ message: 'Costo eliminado' });
  } catch (error) {
    next(error);
  }
};

export const getPagos = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.*,
        prov.nombre AS proveedor_nombre,
        oc.proveedor AS orden_proveedor,
        oc.total AS orden_total
      FROM pagos_proveedores p
      LEFT JOIN proveedores prov ON prov.id = p.id_proveedor
      LEFT JOIN ordenes_compra oc ON oc.id = p.id_orden_compra
      ORDER BY p.fecha_pago DESC, p.id_pago DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createPago = async (req, res, next) => {
  try {
    const {
      id_proveedor,
      id_orden_compra = null,
      monto_pagado,
      metodo_pago,
      estado = 'PENDIENTE'
    } = req.body;

    if (!id_proveedor || !metodo_pago) {
      return res.status(400).json({ error: 'Proveedor y método de pago son obligatorios' });
    }
    if (!isPositiveNumber(monto_pagado)) {
      return res.status(400).json({ error: 'Monto pagado debe ser un número mayor a 0' });
    }
    if (!isIntegerValue(id_proveedor)) {
      return res.status(400).json({ error: 'id_proveedor debe ser un número entero válido' });
    }
    if (id_orden_compra !== null && id_orden_compra !== '' && !isIntegerValue(id_orden_compra)) {
      return res.status(400).json({ error: 'id_orden_compra debe ser un número entero válido' });
    }

    const [result] = await db.query(
      `INSERT INTO pagos_proveedores
       (id_proveedor, id_orden_compra, monto_pagado, metodo_pago, estado)
       VALUES (?, ?, ?, ?, ?)`,
      [id_proveedor, id_orden_compra || null, Number(monto_pagado), metodo_pago, estado]
    );

    res.status(201).json({ message: 'Pago registrado', id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const updatePago = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { monto_pagado, metodo_pago, estado } = req.body;
    if (!metodo_pago) {
      return res.status(400).json({ error: 'Método de pago es obligatorio' });
    }
    if (!isPositiveNumber(monto_pagado)) {
      return res.status(400).json({ error: 'Monto pagado debe ser un número mayor a 0' });
    }

    await db.query(
      `UPDATE pagos_proveedores
       SET monto_pagado = ?, metodo_pago = ?, estado = ?
       WHERE id_pago = ?`,
      [Number(monto_pagado), metodo_pago, estado, id]
    );

    res.json({ message: 'Pago actualizado' });
  } catch (error) {
    next(error);
  }
};

export const deletePago = async (req, res, next) => {
  try {
    await db.query('DELETE FROM pagos_proveedores WHERE id_pago = ?', [req.params.id]);
    res.json({ message: 'Pago eliminado' });
  } catch (error) {
    next(error);
  }
};

export const getResumen = async (req, res, next) => {
  try {
    const [[costos]] = await db.query('SELECT COALESCE(SUM(monto), 0) AS total_costos FROM costos_operativos');
    const [[pagos]] = await db.query('SELECT COALESCE(SUM(monto_pagado), 0) AS total_pagos FROM pagos_proveedores');
    const [[inventario]] = await db.query(`
      SELECT
        COALESCE(SUM(i.stock_actual * p.precio_compra), 0) AS valor_inventario_costo,
        COALESCE(SUM(i.stock_actual * p.precio_venta), 0) AS valor_inventario_venta,
        COALESCE(SUM(i.stock_actual * (p.precio_venta - p.precio_compra)), 0) AS margen_potencial,
        COALESCE(SUM(i.stock_actual), 0) AS unidades_stock
      FROM inventario i
      INNER JOIN productos p ON p.id_producto = i.id_producto
    `);
    const [[ordenes]] = await db.query('SELECT COALESCE(SUM(total), 0) AS total_ordenes FROM ordenes_compra');

    res.json({
      total_costos: costos.total_costos,
      total_pagos: pagos.total_pagos,
      total_ordenes: ordenes.total_ordenes,
      valor_inventario_costo: inventario.valor_inventario_costo,
      valor_inventario_venta: inventario.valor_inventario_venta,
      margen_potencial: inventario.margen_potencial,
      unidades_stock: inventario.unidades_stock,
      saldo_financiero: Number(inventario.valor_inventario_venta || 0) - Number(costos.total_costos || 0) - Number(pagos.total_pagos || 0)
    });
  } catch (error) {
    next(error);
  }
};
