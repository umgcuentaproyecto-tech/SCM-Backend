import {
  obtenerOrdenes,
  obtenerOrdenPorId,
  crearOrden,
  eliminarOrden
} from '../models/ordenes.js';
import { crearLineaOrden, obtenerLineasPorOrden } from '../models/ordenes.js';

import { autorizarOrden } from '../models/ordenes.js';
import { isIntegerValue, isPositiveInteger, isPositiveNumber, isNumberValue } from '../utils/validators.js';

export const getOrdenes = async (req, res, next) => {
  try {
    const ordenes = await obtenerOrdenes();
    res.json(ordenes);
  } catch (error) {
    next(error);
  }
};

export const postOrden = async (req, res, next) => {
  try {
    // soporta envio de líneas: { proveedor, id_proveedor, fecha, total, lines: [{id_producto,cantidad,precio_unitario,total_item}, ...] }
    const payload = req.body;
    if (payload.id_proveedor !== null && payload.id_proveedor !== undefined && payload.id_proveedor !== '' && !isIntegerValue(payload.id_proveedor)) {
      return res.status(400).json({ error: 'id_proveedor debe ser un número entero válido' });
    }
    if (Array.isArray(payload.lines) && payload.lines.length > 0) {
      for (const linea of payload.lines) {
        if (!isIntegerValue(linea.id_producto)) {
          return res.status(400).json({ error: 'id_producto en las líneas debe ser un número entero válido' });
        }
        if (!isPositiveNumber(linea.cantidad)) {
          return res.status(400).json({ error: 'cantidad en las líneas debe ser un número mayor a 0' });
        }
        if (!isPositiveNumber(linea.precio_unitario)) {
          return res.status(400).json({ error: 'precio_unitario en las líneas debe ser un número mayor a 0' });
        }
        if (linea.total_item !== undefined && linea.total_item !== null && linea.total_item !== '' && !isNumberValue(linea.total_item)) {
          return res.status(400).json({ error: 'total_item en las líneas debe ser un número válido' });
        }
      }
      payload.total = payload.lines.reduce((sum, linea) => {
        const cantidad = Number(linea.cantidad || 0);
        const precioUnitario = Number(linea.precio_unitario || 0);
        const totalItem = Number(linea.total_item || (cantidad * precioUnitario));
        return sum + totalItem;
      }, 0);
    }
    const created = await crearOrden(payload);
    const ordenId = created.insertId || (created.result && created.result.insertId);
    if (payload.lines && Array.isArray(payload.lines) && ordenId) {
      for (const linea of payload.lines) {
        await crearLineaOrden(ordenId, linea);
      }
    }
    res.status(201).json({ success: true, ordenId });
  } catch (error) {
    next(error);
  }
};

export const deleteOrden = async (req, res, next) => {
  try {
    const resultado = await eliminarOrden(req.params.id);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const getOrdenById = async (req, res, next) => {
  try {
    const orden = await obtenerOrdenPorId(req.params.id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });
    const lineas = await obtenerLineasPorOrden(req.params.id);
    res.json({ ...orden, lines: lineas });
  } catch (error) {
    next(error);
  }
};

export const authorizeOrden = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { autorizada } = req.body; // optional: 1 or 0
    const flag = typeof autorizada !== 'undefined' ? autorizada : 1;
    const resultado = await autorizarOrden(id, flag);
    res.json({ success: true, result: resultado });
  } catch (error) {
    next(error);
  }
};
