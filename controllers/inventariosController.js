import {
  listarInventarios,
  obtenerInventarioPorId,
  crearInventario,
  actualizarInventario,
  eliminarInventario,
  listarPorProducto
} from '../models/inventarios.js';
import { obtenerAlmacenPorId } from '../models/almacenes.js';
import { isIntegerValue, isNonNegativeInteger } from '../utils/validators.js';

export async function getInventarios(req, res, next) {
  try {
    const rows = await listarInventarios();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getInventarioById(req, res, next) {
  try {
    const inv = await obtenerInventarioPorId(req.params.id);
    if (!inv) return res.status(404).json({ mensaje: 'Not found' });
    res.json(inv);
  } catch (err) {
    next(err);
  }
}

export async function createInventario(req, res, next) {
  try {
    const { id_producto, id_almacen = null, stock_actual = 0, ubicacion = null } = req.body;

    if (!id_producto || !isIntegerValue(id_producto)) return res.status(400).json({ mensaje: 'id_producto es requerido y debe ser un número entero válido' });
    if (!isNonNegativeInteger(stock_actual)) return res.status(400).json({ mensaje: 'stock_actual debe ser un número entero mayor o igual a 0' });
    if (id_almacen !== null && id_almacen !== '' && !isIntegerValue(id_almacen)) return res.status(400).json({ mensaje: 'id_almacen debe ser un número entero válido' });
    if (id_almacen !== null) {
      const almacen = await obtenerAlmacenPorId(id_almacen);
      if (!almacen) return res.status(400).json({ mensaje: 'Almacén no encontrado' });
      if (Number(almacen.estado) !== 1) return res.status(400).json({ mensaje: 'No se puede guardar inventario en un almacén inactivo' });
    }

    const inv = await crearInventario({ id_producto, id_almacen, stock_actual, ubicacion });
    res.status(201).json(inv);
  } catch (err) {
    next(err);
  }
}

export async function updateInventario(req, res, next) {
  try {
    const { id_producto, id_almacen = null, stock_actual = 0, ubicacion = null } = req.body;

    if (!id_producto || !isIntegerValue(id_producto)) return res.status(400).json({ mensaje: 'id_producto es requerido y debe ser un número entero válido' });
    if (!isNonNegativeInteger(stock_actual)) return res.status(400).json({ mensaje: 'stock_actual debe ser un número entero mayor o igual a 0' });
    if (id_almacen !== null && id_almacen !== '' && !isIntegerValue(id_almacen)) return res.status(400).json({ mensaje: 'id_almacen debe ser un número entero válido' });
    if (id_almacen !== null) {
      const almacen = await obtenerAlmacenPorId(id_almacen);
      if (!almacen) return res.status(400).json({ mensaje: 'Almacén no encontrado' });
      if (Number(almacen.estado) !== 1) return res.status(400).json({ mensaje: 'No se puede guardar inventario en un almacén inactivo' });
    }

    const inv = await actualizarInventario(req.params.id, { id_producto, id_almacen, stock_actual, ubicacion });
    if (!inv) return res.status(404).json({ mensaje: 'Not found' });
    res.json(inv);
  } catch (err) {
    next(err);
  }
}

export async function deleteInventario(req, res, next) {
  try {
    const affectedRows = await eliminarInventario(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ mensaje: 'Not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getInventariosPorProducto(req, res, next) {
  try {
    const rows = await listarPorProducto(req.params.productoId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}
