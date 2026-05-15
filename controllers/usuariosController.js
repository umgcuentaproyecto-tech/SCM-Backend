import {
  listarUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioPorCorreo,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../models/usuarios.js';
import { isDigitsOnly, isIntegerValue } from '../utils/validators.js';
import bcrypt from 'bcryptjs';

export async function getUsuarios(req, res, next) {
  try {
    const rows = await listarUsuarios();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getUsuarioById(req, res, next) {
  try {
    const user = await obtenerUsuarioPorId(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function createUsuario(req, res, next) {
  try {
    const { nombre, correo, password, id_rol = null, telefono = null, estado = 1 } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: 'nombre, correo and password are required' });
    }
    if (telefono && !isDigitsOnly(telefono)) {
      return res.status(400).json({ message: 'El teléfono debe contener solo dígitos' });
    }
    if (id_rol !== null && id_rol !== '' && !isIntegerValue(id_rol)) {
      return res.status(400).json({ message: 'id_rol debe ser un número entero válido' });
    }
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) {
      return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    }

    const user = await crearUsuario({ nombre, correo, password, id_rol: id_rol || null, telefono, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateUsuario(req, res, next) {
  try {
    const { nombre, correo, password, id_rol = null, telefono = null, estado = 1 } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({ message: 'nombre and correo are required' });
    }
    if (telefono && !isDigitsOnly(telefono)) {
      return res.status(400).json({ message: 'El teléfono debe contener solo dígitos' });
    }
    if (id_rol !== null && id_rol !== '' && !isIntegerValue(id_rol)) {
      return res.status(400).json({ message: 'id_rol debe ser un número entero válido' });
    }
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) {
      return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    }

    const user = await actualizarUsuario(req.params.id, { nombre, correo, password, id_rol: id_rol || null, telefono, estado: typeof estado === 'undefined' ? 1 : Number(estado) });
    if (!user) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUsuario(req, res, next) {
  try {
    const affectedRows = await eliminarUsuario(req.params.id);

    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// Login (autenticación)
export async function loginUsuario(req, res, next) {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) return res.status(400).json({ message: 'correo and password required' });

    const usuario = await obtenerUsuarioPorCorreo(correo);
    if (!usuario) return res.status(401).json({ message: 'Credenciales inválidas' });

    const match = await bcrypt.compare(password, usuario.password || '');
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });

    // No enviar el hash de contraseña de vuelta
    const { password: _p, ...safeUser } = usuario;

    res.json(safeUser);
  } catch (err) {
    next(err);
  }
}
