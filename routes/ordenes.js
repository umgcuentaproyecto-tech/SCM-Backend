import express from 'express';
import {
  getOrdenes,
  getOrdenById,
  postOrden,
  deleteOrden
} from '../controllers/ordenesController.js';
import { authorizeOrden } from '../controllers/ordenesController.js';

const router = express.Router();

router.get('/', getOrdenes);
router.get('/:id', getOrdenById);
router.post('/', postOrden);
router.delete('/:id', deleteOrden);
router.put('/:id/autorizar', authorizeOrden);

export default router;
