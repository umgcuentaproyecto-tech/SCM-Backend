import express from 'express';
import { getCategorias, createCategoria, obtenerCategoria, updateCategoria, deleteCategoria } from '../controllers/categoriasController.js';

const router = express.Router();

router.get('/', getCategorias);
router.post('/', createCategoria);

router.get('/:id', obtenerCategoria);
router.put('/:id', updateCategoria);
router.delete('/:id', deleteCategoria);

export default router;
