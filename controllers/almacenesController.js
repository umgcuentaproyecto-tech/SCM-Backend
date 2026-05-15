import { listarAlmacenes, obtenerAlmacenPorId, crearAlmacen, actualizarAlmacen, eliminarAlmacen } from '../models/almacenes.js';
import { isDigitsOnly, isIntegerValue } from '../utils/validators.js';

export async function getAlmacenes(req, res, next) {
  try {
    res.json(await listarAlmacenes());
  } catch (err) { next(err); }
}

export async function getAlmacenById(req, res, next) {
  try {
    const almacen = await obtenerAlmacenPorId(req.params.id);
    if (!almacen) return res.status(404).json({ message: 'Almacén no encontrado' });
    res.json(almacen);
  } catch (err) { next(err); }
}

export async function createAlmacen(req, res, next) {
  try {
    const { nombre_almacen, direccion, encargado, telefono, estado } = req.body;
    if (!nombre_almacen) return res.status(400).json({ message: 'nombre_almacen es requerido' });
    if (telefono && !isDigitsOnly(telefono)) return res.status(400).json({ message: 'El teléfono debe contener solo dígitos' });
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    const almacen = await crearAlmacen({ nombre_almacen, direccion, encargado, telefono, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    res.status(201).json(almacen);
  } catch (err) {
    // If the DB table doesn't exist, return a helpful message
    if (err && (err.code === 'ER_NO_SUCH_TABLE' || (err.message && err.message.includes("doesn't exist")))) {
      return res.status(500).json({
        message: 'La tabla "almacenes" no existe en la base de datos. Ejecuta el script de esquema proporcionado: "Sistema SCM almacenes/almacenes_transporte_tablas.sql"',
        details: err.message
      });
    }
    next(err);
  }
}

export async function updateAlmacen(req, res, next) {
  try {
    const { nombre_almacen, direccion, encargado, telefono, estado } = req.body;
    if (!nombre_almacen) return res.status(400).json({ message: 'nombre_almacen es requerido' });
    if (telefono && !isDigitsOnly(telefono)) return res.status(400).json({ message: 'El teléfono debe contener solo dígitos' });
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    const almacen = await actualizarAlmacen(req.params.id, { nombre_almacen, direccion, encargado, telefono, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    if (!almacen) return res.status(404).json({ message: 'Almacén no encontrado' });
    res.json(almacen);
  } catch (err) { next(err); }
}

export async function deleteAlmacen(req, res, next) {
  try {
    const rows = await eliminarAlmacen(req.params.id);
    if (rows === 0) return res.status(404).json({ message: 'Almacén no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
}
