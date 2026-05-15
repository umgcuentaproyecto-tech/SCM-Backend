import express from 'express';
import {
  getProveedores,
  getProveedorById,
  postProveedor,
  putProveedor,
  deleteProveedor
} from '../controllers/proveedoresController.js';

const router = express.Router();

router.get('/', getProveedores);
router.post('/', postProveedor);
router.put('/:id', putProveedor);
router.get('/:id', getProveedorById);
router.delete('/:id', deleteProveedor);

export default router;
