import {
  listarPedidos,
  obtenerPedidoPorId,
  crearPedido,
  actualizarPedido,
  actualizarEstadoPedido,
  eliminarPedido
} from '../models/gestion_pedidos.js';
import { obtenerClientePorId } from '../models/clientes.js';
import { isIntegerValue, isPositiveInteger } from '../utils/validators.js';

function normalizePedidoEstado(estado = 'pendiente') {
  const normalized = String(estado || 'pendiente').toLowerCase();
  return ['pendiente', 'confirmado'].includes(normalized) ? normalized : null;
}

export async function getPedidos(req, res, next) {
  try {
    const rows = await listarPedidos();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getPedidoById(req, res, next) {
  try {
    const pedido = await obtenerPedidoPorId(req.params.id);
    if (!pedido) return res.status(404).json({ message: 'Not found' });
    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

export async function createPedido(req, res, next) {
  try {
    const { id_cliente, items = [], estado = 'pendiente' } = req.body;
    const estadoNormalizado = normalizePedidoEstado(estado);
    if (!id_cliente || !isIntegerValue(id_cliente) || !Array.isArray(items) || items.length === 0 || !estadoNormalizado) {
      return res.status(400).json({ message: 'id_cliente, items y estado válidos son requeridos' });
    }
    for (const item of items) {
      if (!isIntegerValue(item.id_producto) || !isPositiveInteger(item.cantidad)) {
        return res.status(400).json({ message: 'Cada item debe tener id_producto válido y cantidad mayor a 0' });
      }
    }

    const cliente = await obtenerClientePorId(id_cliente);
    if (!cliente) return res.status(400).json({ message: 'Cliente no encontrado' });
    if (Number(cliente.estado) !== 1) return res.status(400).json({ message: 'No se puede crear un pedido para un cliente inactivo' });

    const pedido = await crearPedido({ id_cliente, items, estado: estadoNormalizado });
    res.status(201).json(pedido);
  } catch (err) {
    next(err);
  }
}

export async function updatePedido(req, res, next) {
  try {
    const { id_cliente, items, estado } = req.body;
    const hasFullPayload = id_cliente && Array.isArray(items);
    const estadoNormalizado = estado ? normalizePedidoEstado(estado) : null;

    if (!estadoNormalizado) {
      return res.status(400).json({ message: 'Estado de pedido inválido' });
    }
    if (hasFullPayload) {
      if (!isIntegerValue(id_cliente)) {
        return res.status(400).json({ message: 'id_cliente debe ser un número entero válido' });
      }
      for (const item of items) {
        if (!isIntegerValue(item.id_producto) || !isPositiveInteger(item.cantidad)) {
          return res.status(400).json({ message: 'Cada item debe tener id_producto válido y cantidad mayor a 0' });
        }
      }
      const cliente = await obtenerClientePorId(id_cliente);
      if (!cliente) return res.status(400).json({ message: 'Cliente no encontrado' });
      if (Number(cliente.estado) !== 1) return res.status(400).json({ message: 'No se puede actualizar un pedido con un cliente inactivo' });
    }

    const pedido = hasFullPayload
      ? await actualizarPedido(req.params.id, { id_cliente, items, estado: estadoNormalizado })
      : await actualizarEstadoPedido(req.params.id, estadoNormalizado);

    if (!pedido) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(pedido);
  } catch (err) {
    next(err);
  }
}

export async function deletePedido(req, res, next) {
  try {
    const affectedRows = await eliminarPedido(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
