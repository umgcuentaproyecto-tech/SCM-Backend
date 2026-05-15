import express from 'express';
import {
  getInventarios,
  getInventarioById,
  createInventario,
  updateInventario,
  deleteInventario,
  getInventariosPorProducto
} from '../controllers/inventariosController.js';

const router = express.Router();

router.get('/', getInventarios);
router.post('/', createInventario);
router.get('/producto/:productoId', getInventariosPorProducto);
router.get('/:id', getInventarioById);
router.put('/:id', updateInventario);
router.delete('/:id', deleteInventario);

export default router;
