import { listarEnvios, obtenerEnvioPorId, crearEnvio, actualizarEnvio, eliminarEnvio } from '../models/envios.js';
import { isIntegerValue, isNumberValue } from '../utils/validators.js';

export async function getEnvios(req, res, next) {
  try {
    res.json(await listarEnvios());
  } catch (err) { next(err); }
}

export async function getEnvioById(req, res, next) {
  try {
    const envio = await obtenerEnvioPorId(req.params.id);
    if (!envio) return res.status(404).json({ message: 'Envío no encontrado' });
    res.json(envio);
  } catch (err) { next(err); }
}

export async function createEnvio(req, res, next) {
  try {
    const { id_pedido, id_transportista, id_vehiculo, id_ruta, direccion_entrega, fecha_salida, fecha_entrega, estado, costo_envio } = req.body;
    if (!direccion_entrega) return res.status(400).json({ message: 'direccion_entrega es requerida' });
    if (id_pedido !== null && id_pedido !== undefined && id_pedido !== '' && !isIntegerValue(id_pedido)) return res.status(400).json({ message: 'id_pedido debe ser un número entero válido' });
    if (id_transportista !== null && id_transportista !== undefined && id_transportista !== '' && !isIntegerValue(id_transportista)) return res.status(400).json({ message: 'id_transportista debe ser un número entero válido' });
    if (id_vehiculo !== null && id_vehiculo !== undefined && id_vehiculo !== '' && !isIntegerValue(id_vehiculo)) return res.status(400).json({ message: 'id_vehiculo debe ser un número entero válido' });
    if (id_ruta !== null && id_ruta !== undefined && id_ruta !== '' && !isIntegerValue(id_ruta)) return res.status(400).json({ message: 'id_ruta debe ser un número entero válido' });
    if (costo_envio !== null && costo_envio !== undefined && costo_envio !== '' && !isNumberValue(costo_envio)) return res.status(400).json({ message: 'costo_envio debe ser un número válido' });
    const envio = await crearEnvio({ id_pedido, id_transportista, id_vehiculo, id_ruta, direccion_entrega, fecha_salida, fecha_entrega, estado, costo_envio });
    res.status(201).json(envio);
  } catch (err) { next(err); }
}

export async function updateEnvio(req, res, next) {
  try {
    const { id_pedido, id_transportista, id_vehiculo, id_ruta, direccion_entrega, fecha_salida, fecha_entrega, estado, costo_envio } = req.body;
    if (!direccion_entrega) return res.status(400).json({ message: 'direccion_entrega es requerida' });
    if (id_pedido !== null && id_pedido !== undefined && id_pedido !== '' && !isIntegerValue(id_pedido)) return res.status(400).json({ message: 'id_pedido debe ser un número entero válido' });
    if (id_transportista !== null && id_transportista !== undefined && id_transportista !== '' && !isIntegerValue(id_transportista)) return res.status(400).json({ message: 'id_transportista debe ser un número entero válido' });
    if (id_vehiculo !== null && id_vehiculo !== undefined && id_vehiculo !== '' && !isIntegerValue(id_vehiculo)) return res.status(400).json({ message: 'id_vehiculo debe ser un número entero válido' });
    if (id_ruta !== null && id_ruta !== undefined && id_ruta !== '' && !isIntegerValue(id_ruta)) return res.status(400).json({ message: 'id_ruta debe ser un número entero válido' });
    if (costo_envio !== null && costo_envio !== undefined && costo_envio !== '' && !isNumberValue(costo_envio)) return res.status(400).json({ message: 'costo_envio debe ser un número válido' });
    const envio = await actualizarEnvio(req.params.id, { id_pedido, id_transportista, id_vehiculo, id_ruta, direccion_entrega, fecha_salida, fecha_entrega, estado, costo_envio });
    if (!envio) return res.status(404).json({ message: 'Envío no encontrado' });
    res.json(envio);
  } catch (err) { next(err); }
}

export async function deleteEnvio(req, res, next) {
  try {
    const rows = await eliminarEnvio(req.params.id);
    if (rows === 0) return res.status(404).json({ message: 'Envío no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
}
