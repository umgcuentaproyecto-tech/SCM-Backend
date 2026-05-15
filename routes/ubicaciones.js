import express from 'express';
import { getUbicaciones, getUbicacionById, createUbicacion, updateUbicacion, deleteUbicacion } from '../controllers/ubicacionesController.js';

const router = express.Router();

router.get('/', getUbicaciones);
router.get('/:id', getUbicacionById);
router.post('/', createUbicacion);
router.put('/:id', updateUbicacion);
router.delete('/:id', deleteUbicacion);

export default router;
 
