import {
  obtenerCompras,
  crearCompra,
  eliminarCompra
} from '../models/compras.js';
import { isPositiveInteger, isPositiveNumber } from '../utils/validators.js';

export const getCompras = async (req, res, next) => {
  try {
    const compras = await obtenerCompras();
    res.json(compras);
  } catch (error) {
    next(error);
  }
};

export const postCompra = async (req, res, next) => {
  try {
    const { producto, cantidad, total, fecha } = req.body;
    if (!producto) return res.status(400).json({ error: 'producto es requerido' });
    if (!isPositiveInteger(cantidad)) return res.status(400).json({ error: 'cantidad debe ser un número entero mayor a 0' });
    if (!isPositiveNumber(total)) return res.status(400).json({ error: 'total debe ser un número mayor a 0' });
    const resultado = await crearCompra({ producto, cantidad, total, fecha });
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const deleteCompra = async (req, res, next) => {
  try {
    const resultado = await eliminarCompra(req.params.id);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};
