import {
  obtenerRecepciones,
  crearRecepcion,
  eliminarRecepcion
} from '../models/recepciones.js';
import { obtenerOrdenPorId } from '../models/ordenes.js';
import { obtenerAlmacenPorId } from '../models/almacenes.js';
import db from '../db.js';
import { isIntegerValue } from '../utils/validators.js';

export const getRecepciones = async (req, res, next) => {
  try {
    const recepciones = await obtenerRecepciones();
    res.json(recepciones);
  } catch (error) {
    next(error);
  }
};

export const postRecepcion = async (req, res, next) => {
  try {
    const { orden_id, id_almacen = null } = req.body;
    if (!orden_id || !isIntegerValue(orden_id)) {
      return res.status(400).json({ error: 'orden_id es requerido y debe ser un número entero válido' });
    }
    if (id_almacen !== null && id_almacen !== '' && !isIntegerValue(id_almacen)) {
      return res.status(400).json({ error: 'id_almacen debe ser un número entero válido' });
    }
    // validar que la orden de compra exista
    const orden = await obtenerOrdenPorId(orden_id);
    if (!orden) return res.status(400).json({ error: 'Orden de compra no encontrada' });

    // validar almacén destino
    if (id_almacen !== null) {
      const almacen = await obtenerAlmacenPorId(id_almacen);
      if (!almacen) return res.status(400).json({ error: 'Almacén destino no encontrado' });
      if (Number(almacen.estado) !== 1) {
        return res.status(400).json({ error: 'No se puede guardar la recepción en un almacén inactivo' });
      }
    }

    // no permitir recepciones parciales
    if (req.body.estado && String(req.body.estado).toLowerCase() === 'parcial') {
      return res.status(400).json({ error: 'Recepciones parciales no están permitidas' });
    }

    const resultado = await crearRecepcion(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const deleteRecepcion = async (req, res, next) => {
  try {
    const resultado = await eliminarRecepcion(req.params.id);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const putRecepcionEstado = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const id = req.params.id;
    const cambios = req.body; // { estado: 'recibida' }
    const nuevoEstado = cambios.estado && String(cambios.estado).toLowerCase();

    if (nuevoEstado === 'parcial') {
      return res.status(400).json({ error: 'Recepciones parciales no están permitidas' });
    }

    await connection.beginTransaction();

    const [recepcionesRows] = await connection.query(
      'SELECT id, orden_id, estado, id_almacen FROM recepciones WHERE id = ? FOR UPDATE',
      [id]
    );
    const recepcion = recepcionesRows[0];
    if (!recepcion) {
      await connection.rollback();
      return res.status(404).json({ error: 'Recepción no encontrada' });
    }

    const [resultado] = await connection.query('UPDATE recepciones SET estado = ? WHERE id = ?', [cambios.estado, id]);

    // Si la recepción se marca como recibida, actualizar inventario según las líneas de la orden
    if (nuevoEstado === 'recibido' || nuevoEstado === 'recibida') {
      const estadoAnterior = String(recepcion.estado || '').toLowerCase();
      if (estadoAnterior !== 'recibido' && estadoAnterior !== 'recibida') {
        const ordenId = recepcion.orden_id;
        const [lineas] = await connection.query(
          'SELECT id_producto, cantidad FROM ordenes_compra_detalles WHERE orden_id = ?',
          [ordenId]
        );
        const idAlmacen = recepcion.id_almacen || null;

        for (const linea of lineas) {
          const id_producto = linea.id_producto;
          const cantidad = Number(linea.cantidad || 0);
          if (cantidad <= 0) continue;

          const [inventarios] = await connection.query(
            `SELECT id_inventario, stock_actual
             FROM inventario
             WHERE id_producto = ? AND (id_almacen = ? OR (? IS NULL AND id_almacen IS NULL))
             LIMIT 1
             FOR UPDATE`,
            [id_producto, idAlmacen, idAlmacen]
          );

          if (inventarios.length > 0) {
            const inventario = inventarios[0];
            const nuevoStock = Number(inventario.stock_actual || 0) + cantidad;
            await connection.query(
              'UPDATE inventario SET stock_actual = ?, fecha_actualizacion = NOW() WHERE id_inventario = ?',
              [nuevoStock, inventario.id_inventario]
            );
          } else {
            await connection.query(
              'INSERT INTO inventario (id_producto, id_almacen, stock_actual, ubicacion, fecha_actualizacion) VALUES (?, ?, ?, NULL, NOW())',
              [id_producto, idAlmacen, cantidad]
            );
          }
        }

        await connection.query('DELETE FROM ordenes_compra WHERE id = ?', [ordenId]);
      }
    }

    await connection.commit();
    res.json({ success: true, result: resultado });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_) {
      // ignore rollback errors
    }
    next(error);
  } finally {
    connection.release();
  }
};
