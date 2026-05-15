import { listarRutas, obtenerRutaPorId, crearRuta, actualizarRuta, eliminarRuta } from '../models/rutas.js';
import { isIntegerValue, isNumberValue } from '../utils/validators.js';

export async function getRutas(req, res, next) {
  try {
    res.json(await listarRutas());
  } catch (err) { next(err); }
}

export async function getRutaById(req, res, next) {
  try {
    const ruta = await obtenerRutaPorId(req.params.id);
    if (!ruta) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json(ruta);
  } catch (err) { next(err); }
}

export async function createRuta(req, res, next) {
  try {
    const { nombre_ruta, origen, destino, distancia_km, tiempo_estimado, costo_base, estado } = req.body;
    if (!nombre_ruta || !origen || !destino) return res.status(400).json({ message: 'nombre_ruta, origen y destino son requeridos' });
    if (typeof distancia_km !== 'undefined' && distancia_km !== null && !isNumberValue(distancia_km)) return res.status(400).json({ message: 'distancia_km debe ser un número válido' });
    if (typeof tiempo_estimado !== 'undefined' && tiempo_estimado !== null && !isNumberValue(tiempo_estimado)) return res.status(400).json({ message: 'tiempo_estimado debe ser un número válido' });
    if (typeof costo_base !== 'undefined' && costo_base !== null && !isNumberValue(costo_base)) return res.status(400).json({ message: 'costo_base debe ser un número válido' });
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    const ruta = await crearRuta({ nombre_ruta, origen, destino, distancia_km, tiempo_estimado, costo_base, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    res.status(201).json(ruta);
  } catch (err) { next(err); }
}

export async function updateRuta(req, res, next) {
  try {
    const { nombre_ruta, origen, destino, distancia_km, tiempo_estimado, costo_base, estado } = req.body;
    if (!nombre_ruta || !origen || !destino) return res.status(400).json({ message: 'nombre_ruta, origen y destino son requeridos' });
    if (typeof distancia_km !== 'undefined' && distancia_km !== null && !isNumberValue(distancia_km)) return res.status(400).json({ message: 'distancia_km debe ser un número válido' });
    if (typeof tiempo_estimado !== 'undefined' && tiempo_estimado !== null && !isNumberValue(tiempo_estimado)) return res.status(400).json({ message: 'tiempo_estimado debe ser un número válido' });
    if (typeof costo_base !== 'undefined' && costo_base !== null && !isNumberValue(costo_base)) return res.status(400).json({ message: 'costo_base debe ser un número válido' });
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    const ruta = await actualizarRuta(req.params.id, { nombre_ruta, origen, destino, distancia_km, tiempo_estimado, costo_base, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    if (!ruta) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.json(ruta);
  } catch (err) { next(err); }
}

export async function deleteRuta(req, res, next) {
  try {
    const rows = await eliminarRuta(req.params.id);
    if (rows === 0) return res.status(404).json({ message: 'Ruta no encontrada' });
    res.status(204).send();
  } catch (err) { next(err); }
}
