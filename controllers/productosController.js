import {
  listarProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerProductoPorCodigo
} from '../models/productos.js';
import { isIntegerValue, isNonNegativeInteger, isNumberValue } from '../utils/validators.js';

export async function getProductos(req, res, next) {
  try {
    const productos = await listarProductos();
    res.json(productos);
  } catch (err) {
    next(err);
  }
}

export async function getProductoById(req, res, next) {
  try {
    const producto = await obtenerProductoPorId(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Not found' });
    res.json(producto);
  } catch (err) {
    next(err);
  }
}

export async function createProducto(req, res, next) {
  try {
    const {
      nombre_producto,
      codigo_producto,
      id_categoria = null,
      id_proveedor = null,
      precio_compra = 0,
      precio_venta = 0,
      stock_minimo = 0,
      stock_maximo = 0,
      estado = 1
    } = req.body;

    if (!nombre_producto) {
      return res.status(400).json({ message: 'nombre_producto is required' });
    }
    if (codigo_producto) {
      const exists = await obtenerProductoPorCodigo(codigo_producto);
      if (exists) return res.status(409).json({ message: 'Código de producto ya existe' });
    }
    if (id_categoria !== null && id_categoria !== '' && !isIntegerValue(id_categoria)) {
      return res.status(400).json({ message: 'id_categoria debe ser un número entero válido' });
    }
    if (id_proveedor !== null && id_proveedor !== '' && !isIntegerValue(id_proveedor)) {
      return res.status(400).json({ message: 'id_proveedor debe ser un número entero válido' });
    }
    if (precio_compra !== null && precio_compra !== '' && !isNumberValue(precio_compra)) {
      return res.status(400).json({ message: 'precio_compra debe ser un número válido' });
    }
    if (precio_venta !== null && precio_venta !== '' && !isNumberValue(precio_venta)) {
      return res.status(400).json({ message: 'precio_venta debe ser un número válido' });
    }
    if (!isNonNegativeInteger(stock_minimo)) {
      return res.status(400).json({ message: 'stock_minimo debe ser un entero mayor o igual a 0' });
    }
    if (!isNonNegativeInteger(stock_maximo)) {
      return res.status(400).json({ message: 'stock_maximo debe ser un entero mayor o igual a 0' });
    }
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) {
      return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    }

    const producto = await crearProducto(req.body);
    res.status(201).json(producto);
  } catch (err) {
    next(err);
  }
}

export async function updateProducto(req, res, next) {
  try {
    const {
      nombre_producto,
      codigo_producto,
      id_categoria = null,
      id_proveedor = null,
      precio_compra = 0,
      precio_venta = 0,
      stock_minimo = 0,
      stock_maximo = 0,
      estado = 1
    } = req.body;
    if (!nombre_producto) {
      return res.status(400).json({ message: 'nombre_producto is required' });
    }

    if (codigo_producto) {
      const exists = await obtenerProductoPorCodigo(codigo_producto);
      if (exists && Number(exists.id_producto) !== Number(req.params.id)) {
        return res.status(409).json({ message: 'Ya existe otro producto con ese código. Ingresa un código diferente.' });
      }
    }
    if (id_categoria !== null && id_categoria !== '' && !isIntegerValue(id_categoria)) {
      return res.status(400).json({ message: 'id_categoria debe ser un número entero válido' });
    }
    if (id_proveedor !== null && id_proveedor !== '' && !isIntegerValue(id_proveedor)) {
      return res.status(400).json({ message: 'id_proveedor debe ser un número entero válido' });
    }
    if (precio_compra !== null && precio_compra !== '' && !isNumberValue(precio_compra)) {
      return res.status(400).json({ message: 'precio_compra debe ser un número válido' });
    }
    if (precio_venta !== null && precio_venta !== '' && !isNumberValue(precio_venta)) {
      return res.status(400).json({ message: 'precio_venta debe ser un número válido' });
    }
    if (!isNonNegativeInteger(stock_minimo)) {
      return res.status(400).json({ message: 'stock_minimo debe ser un entero mayor o igual a 0' });
    }
    if (!isNonNegativeInteger(stock_maximo)) {
      return res.status(400).json({ message: 'stock_maximo debe ser un entero mayor o igual a 0' });
    }
    if (typeof estado !== 'undefined' && estado !== null && !isIntegerValue(estado)) {
      return res.status(400).json({ message: 'estado debe ser 0 o 1' });
    }

    const producto = await actualizarProducto(req.params.id, req.body);
    if (!producto) return res.status(404).json({ message: 'Not found' });
    res.json(producto);
  } catch (err) {
    next(err);
  }
}

export async function deleteProducto(req, res, next) {
  try {
    const affectedRows = await eliminarProducto(req.params.id);
    if (affectedRows === 0) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
      return res.status(409).json({
        message: 'No se puede eliminar este producto porque tiene inventario, pedidos, compras u otros registros relacionados. Elimina o actualiza esos registros primero.'
      });
    }
    next(err);
  }
}
