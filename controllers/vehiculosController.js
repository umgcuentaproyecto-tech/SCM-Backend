import { listarVehiculos, obtenerVehiculoPorId, crearVehiculo, actualizarVehiculo, eliminarVehiculo } from '../models/vehiculos.js';
import { isIntegerValue, isNumberValue } from '../utils/validators.js';

export async function getVehiculos(req, res, next) {
  try {
    res.json(await listarVehiculos());
  } catch (err) { next(err); }
}

export async function getVehiculoById(req, res, next) {
  try {
    const v = await obtenerVehiculoPorId(req.params.id);
    if (!v) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json(v);
  } catch (err) { next(err); }
}

export async function createVehiculo(req, res, next) {
  try {
    const { placa, marca, modelo, capacidad_carga, id_transportista, estado } = req.body;
    if (!placa) return res.status(400).json({ message: 'placa es requerida' });
    if (typeof capacidad_carga !== 'undefined' && capacidad_carga !== null && !isNumberValue(capacidad_carga)) return res.status(400).json({ message: 'capacidad_carga debe ser un número válido' });
    if (id_transportista !== null && id_transportista !== undefined && id_transportista !== '' && !isIntegerValue(id_transportista)) return res.status(400).json({ message: 'id_transportista debe ser un número entero valido' });
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    const v = await crearVehiculo({ placa, marca, modelo, capacidad_carga: typeof capacidad_carga === 'undefined' ? null : Number(capacidad_carga), id_transportista: id_transportista || null, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    res.status(201).json(v);
  } catch (err) { next(err); }
}

export async function updateVehiculo(req, res, next) {
  try {
    const { placa, marca, modelo, capacidad_carga, id_transportista, estado } = req.body;
    if (!placa) return res.status(400).json({ message: 'placa es requerida' });
    if (typeof capacidad_carga !== 'undefined' && capacidad_carga !== null && !isNumberValue(capacidad_carga)) return res.status(400).json({ message: 'capacidad_carga debe ser un número válido' });
    if (id_transportista !== null && id_transportista !== undefined && id_transportista !== '' && !isIntegerValue(id_transportista)) return res.status(400).json({ message: 'id_transportista debe ser un número entero valido' });
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    const v = await actualizarVehiculo(req.params.id, { placa, marca, modelo, capacidad_carga: typeof capacidad_carga === 'undefined' ? null : Number(capacidad_carga), id_transportista: id_transportista || null, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    if (!v) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json(v);
  } catch (err) { next(err); }
}

export async function deleteVehiculo(req, res, next) {
  try {
    const rows = await eliminarVehiculo(req.params.id);
    if (rows === 0) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.status(204).send();
  } catch (err) { next(err); }
}
