import db from '../db.js';

const fields = `
  v.id_vehiculo, v.placa, v.marca, v.modelo, v.capacidad_carga, v.id_transportista, v.estado,
  t.nombre_transportista
`;
const join = `FROM vehiculos v LEFT JOIN transportistas t ON t.id_transportista = v.id_transportista`;

export async function listarVehiculos() {
  const [rows] = await db.query(`SELECT ${fields} ${join} ORDER BY v.id_vehiculo DESC`);
  return rows;
}

export async function obtenerVehiculoPorId(id) {
  const [rows] = await db.query(`SELECT ${fields} ${join} WHERE v.id_vehiculo = ?`, [id]);
  return rows[0] || null;
}

export async function crearVehiculo(data) {
  const { placa, marca = null, modelo = null, capacidad_carga = null, id_transportista = null, estado = 1 } = data;
  const [result] = await db.query(
    'INSERT INTO vehiculos (placa, marca, modelo, capacidad_carga, id_transportista, estado) VALUES (?, ?, ?, ?, ?, ?)',
    [placa, marca, modelo, capacidad_carga, id_transportista, estado]
  );
  return obtenerVehiculoPorId(result.insertId);
}

export async function actualizarVehiculo(id, data) {
  const { placa, marca = null, modelo = null, capacidad_carga = null, id_transportista = null, estado = 1 } = data;
  const [result] = await db.query(
    'UPDATE vehiculos SET placa = ?, marca = ?, modelo = ?, capacidad_carga = ?, id_transportista = ?, estado = ? WHERE id_vehiculo = ?',
    [placa, marca, modelo, capacidad_carga, id_transportista, estado, id]
  );
  if (result.affectedRows === 0) return null;
  return obtenerVehiculoPorId(id);
}

export async function eliminarVehiculo(id) {
  const [result] = await db.query('DELETE FROM vehiculos WHERE id_vehiculo = ?', [id]);
  return result.affectedRows;
}
