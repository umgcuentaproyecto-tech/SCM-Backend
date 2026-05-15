import {
  listarRoles,
  obtenerRolPorId,
  crearRol,
  actualizarRol,
  eliminarRol
} from "../models/roles.js";

export async function getRoles(req, res, next) {
  try {
    const rows = await listarRoles();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getRolById(req, res, next) {
  try {
    const role = await obtenerRolPorId(req.params.id);
    if (!role) return res.status(404).json({ message: "Not found" });
    res.json(role);
  } catch (err) {
    next(err);
  }
}

export async function createRol(req, res, next) {
  try {
    const { nombre_rol, descripcion = null, estado = 1 } = req.body;

    if (!nombre_rol) {
      return res.status(400).json({ message: "nombre_rol is required" });
    }

    const role = await crearRol({ nombre_rol, descripcion, estado });
    res.status(201).json(role);
  } catch (err) {
    next(err);
  }
}

export async function updateRol(req, res, next) {
  try {
    const { nombre_rol, descripcion = null, estado = 1 } = req.body;

    if (!nombre_rol) {
      return res.status(400).json({ message: "nombre_rol is required" });
    }

    const role = await actualizarRol(req.params.id, { nombre_rol, descripcion, estado });
    if (!role) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(role);
  } catch (err) {
    next(err);
  }
}

export async function deleteRol(req, res, next) {
  try {
    const affectedRows = await eliminarRol(req.params.id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
