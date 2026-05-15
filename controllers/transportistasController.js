import { listarTransportistas, obtenerTransportistaPorId, crearTransportista, actualizarTransportista, eliminarTransportista } from '../models/transportistas.js';
import { isDigitsOnly, isIntegerValue } from '../utils/validators.js';

export async function getTransportistas(req, res, next) {
  try {
    res.json(await listarTransportistas());
  } catch (err) { next(err); }
}

export async function getTransportistaById(req, res, next) {
  try {
    const t = await obtenerTransportistaPorId(req.params.id);
    if (!t) return res.status(404).json({ message: 'Transportista no encontrado' });
    res.json(t);
  } catch (err) { next(err); }
}

export async function createTransportista(req, res, next) {
  try {
    const { nombre_transportista, telefono, correo, tipo, estado } = req.body;
    if (!nombre_transportista) return res.status(400).json({ message: 'nombre_transportista es requerido' });
    if (telefono && !isDigitsOnly(telefono)) return res.status(400).json({ message: 'El teléfono debe contener solo dígitos' });
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    const t = await crearTransportista({ nombre_transportista, telefono, correo, tipo, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    res.status(201).json(t);
  } catch (err) { next(err); }
}

export async function updateTransportista(req, res, next) {
  try {
    const { nombre_transportista, telefono, correo, tipo, estado } = req.body;
    if (!nombre_transportista) return res.status(400).json({ message: 'nombre_transportista es requerido' });
    if (telefono && !isDigitsOnly(telefono)) return res.status(400).json({ message: 'El teléfono debe contener solo dígitos' });
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    const t = await actualizarTransportista(req.params.id, { nombre_transportista, telefono, correo, tipo, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    if (!t) return res.status(404).json({ message: 'Transportista no encontrado' });
    res.json(t);
  } catch (err) { next(err); }
}

export async function deleteTransportista(req, res, next) {
  try {
    const rows = await eliminarTransportista(req.params.id);
    if (rows === 0) return res.status(404).json({ message: 'Transportista no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
}
