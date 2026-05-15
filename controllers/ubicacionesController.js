import { listarUbicaciones, listarUbicacionesPorAlmacen, obtenerUbicacionPorId, crearUbicacion, actualizarUbicacion, eliminarUbicacion } from '../models/ubicaciones.js';
import { isIntegerValue } from '../utils/validators.js';

export async function getUbicaciones(req, res, next) {
  try {
    const { id_almacen } = req.query;
    const rows = id_almacen ? await listarUbicacionesPorAlmacen(id_almacen) : await listarUbicaciones();
    res.json(rows);
  } catch (err) { next(err); }
}

export async function getUbicacionById(req, res, next) {
  try {
    const ubicacion = await obtenerUbicacionPorId(req.params.id);
    if (!ubicacion) return res.status(404).json({ message: 'Ubicación no encontrada' });
    res.json(ubicacion);
  } catch (err) { next(err); }
}

export async function createUbicacion(req, res, next) {
  try {
    const { id_almacen, pasillo, estante, nivel, descripcion } = req.body;
    if (!id_almacen || !isIntegerValue(id_almacen)) return res.status(400).json({ message: 'id_almacen es requerido y debe ser un número entero válido' });
    if (pasillo !== undefined && pasillo !== null && pasillo !== '' && !isIntegerValue(pasillo)) return res.status(400).json({ message: 'pasillo debe ser un número entero válido' });
    if (estante !== undefined && estante !== null && estante !== '' && !isIntegerValue(estante)) return res.status(400).json({ message: 'estante debe ser un número entero válido' });
    if (nivel !== undefined && nivel !== null && nivel !== '' && !isIntegerValue(nivel)) return res.status(400).json({ message: 'nivel debe ser un número entero válido' });
    const ubicacion = await crearUbicacion({ id_almacen, pasillo, estante, nivel, descripcion });
    res.status(201).json(ubicacion);
  } catch (err) { next(err); }
}

export async function updateUbicacion(req, res, next) {
  try {
    const { id_almacen, pasillo, estante, nivel, descripcion } = req.body;
    if (!id_almacen || !isIntegerValue(id_almacen)) return res.status(400).json({ message: 'id_almacen es requerido y debe ser un número entero válido' });
    if (pasillo !== undefined && pasillo !== null && pasillo !== '' && !isIntegerValue(pasillo)) return res.status(400).json({ message: 'pasillo debe ser un número entero válido' });
    if (estante !== undefined && estante !== null && estante !== '' && !isIntegerValue(estante)) return res.status(400).json({ message: 'estante debe ser un número entero válido' });
    if (nivel !== undefined && nivel !== null && nivel !== '' && !isIntegerValue(nivel)) return res.status(400).json({ message: 'nivel debe ser un número entero válido' });
    const ubicacion = await actualizarUbicacion(req.params.id, { id_almacen, pasillo, estante, nivel, descripcion });
    if (!ubicacion) return res.status(404).json({ message: 'Ubicación no encontrada' });
    res.json(ubicacion);
  } catch (err) { next(err); }
}

export async function deleteUbicacion(req, res, next) {
  try {
    const rows = await eliminarUbicacion(req.params.id);
    if (rows === 0) return res.status(404).json({ message: 'Ubicación no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
}
 
