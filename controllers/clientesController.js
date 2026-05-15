import {
  listarClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} from '../models/clientes.js';
import { isDigitsOnly, isIntegerValue } from '../utils/validators.js';

export async function getClientes(req, res, next) {
  try {
    const clientes = await listarClientes();
    res.json(clientes);
  } catch (err) {
    next(err);
  }
}

export async function getClienteById(req, res, next) {
  try {
    const cliente = await obtenerClientePorId(req.params.id);
    if (!cliente) return res.status(404).json({ message: 'Not found' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

export async function createCliente(req, res, next) {
  try {
    const { nombre, correo, telefono = null, direccion = null, estado = 1 } = req.body;
    if (!nombre || !correo) {
      return res.status(400).json({ message: 'nombre and correo are required' });
    }
    if (telefono && !isDigitsOnly(telefono)) {
      return res.status(400).json({ message: 'El teléfono debe contener solo dígitos' });
    }
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) {
      return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    }
    const cliente = await crearCliente({ nombre, correo, telefono, direccion, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    res.status(201).json(cliente);
  } catch (err) {
    next(err);
  }
}

export async function updateCliente(req, res, next) {
  try {
    const { nombre, correo, telefono = null, direccion = null, estado = 1 } = req.body;
    if (!nombre || !correo) {
      return res.status(400).json({ message: 'nombre and correo are required' });
    }
    if (telefono && !isDigitsOnly(telefono)) {
      return res.status(400).json({ message: 'El teléfono debe contener solo dígitos' });
    }
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) {
      return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    }
    const cliente = await actualizarCliente(req.params.id, { nombre, correo, telefono, direccion, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    if (!cliente) return res.status(404).json({ message: 'Not found' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
}

export async function deleteCliente(req, res, next) {
  try {
    const affectedRows = await eliminarCliente(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
