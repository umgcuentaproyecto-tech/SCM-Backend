import { listarCategorias, crearCategoria, obtenerCategoriaPorId, actualizarCategoria, eliminarCategoria } from '../models/categorias.js';

export async function getCategorias(req, res, next) {
  try {
    const categorias = await listarCategorias();
    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

export async function createCategoria(req, res, next) {
  try {
    const { nombre_categoria, descripcion = null } = req.body;
    if (!nombre_categoria) {
      return res.status(400).json({ mensaje: 'nombre_categoria es requerido' });
    }

    const categoria = await crearCategoria({ nombre_categoria, descripcion, estado: 1 });
    res.status(201).json({ mensaje: 'Categoría creada correctamente', categoria });
  } catch (err) {
    next(err);
  }
}

export async function obtenerCategoria(req, res, next) {
  try {
    const categoria = await obtenerCategoriaPorId(req.params.id);
    if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

export async function updateCategoria(req, res, next) {
  try {
    const { nombre_categoria, descripcion = null, estado = 1 } = req.body;
    if (!nombre_categoria) return res.status(400).json({ mensaje: 'nombre_categoria es requerido' });

    const categoria = await actualizarCategoria(req.params.id, { nombre_categoria, descripcion, estado });
    if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada' });

    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategoria(req, res, next) {
  try {
    const affectedRows = await eliminarCategoria(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
