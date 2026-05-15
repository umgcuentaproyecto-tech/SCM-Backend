import express from 'express';
import {
  getCompras,
  postCompra,
  deleteCompra
} from '../controllers/comprasController.js';

const router = express.Router();

router.get('/', getCompras);
router.post('/', postCompra);
router.delete('/:id', deleteCompra);

export default router;
