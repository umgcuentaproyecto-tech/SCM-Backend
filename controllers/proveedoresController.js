import {
  obtenerProveedores,
  obtenerProveedorPorId,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} from '../models/proveedores.js';
import { buscarProveedoresPorNombre } from '../models/proveedores.js';
import { isDigitsOnly } from '../utils/validators.js';

export const getProveedores = async (req, res, next) => {
  try {
    const { search } = req.query;
    if (search && String(search).trim().length > 0) {
      const encontrados = await buscarProveedoresPorNombre(search.trim());
      return res.json(encontrados);
    }
    const proveedores = await obtenerProveedores();
    res.json(proveedores);
  } catch (error) {
    next(error);
  }
};

export const postProveedor = async (req, res, next) => {
  try {
    const { telefono } = req.body;
    if (telefono && !isDigitsOnly(telefono)) {
      return res.status(400).json({ message: 'El teléfono debe contener solo dígitos' });
    }
    const resultado = await crearProveedor(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const getProveedorById = async (req, res, next) => {
  try {
    const proveedor = await obtenerProveedorPorId(req.params.id);
    if (!proveedor) return res.status(404).json({ message: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (error) {
    next(error);
  }
};

export const putProveedor = async (req, res, next) => {
  try {
    const { nombre, telefono } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: 'El nombre del proveedor es requerido' });
    }
    if (telefono && !isDigitsOnly(telefono)) {
      return res.status(400).json({ message: 'El teléfono debe contener solo dígitos' });
    }

    const proveedorActual = await obtenerProveedorPorId(req.params.id);
    if (!proveedorActual) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }

    await actualizarProveedor(req.params.id, req.body);
    const proveedor = await obtenerProveedorPorId(req.params.id);
    res.json({ message: 'Proveedor actualizado correctamente', proveedor });
  } catch (error) {
    next(error);
  }
};

export const deleteProveedor = async (req, res, next) => {
  try {
    const resultado = await eliminarProveedor(req.params.id);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};
