import express from 'express';
import { getAlmacenes, getAlmacenById, createAlmacen, updateAlmacen, deleteAlmacen } from '../controllers/almacenesController.js';

const router = express.Router();

router.get('/', getAlmacenes);
router.get('/:id', getAlmacenById);
router.post('/', createAlmacen);
router.put('/:id', updateAlmacen);
router.delete('/:id', deleteAlmacen);

export default router;
