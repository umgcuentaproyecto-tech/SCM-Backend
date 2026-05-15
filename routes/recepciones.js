import express from 'express';
import {
  getRecepciones,
  postRecepcion,
  deleteRecepcion
} from '../controllers/recepcionesController.js';
import { putRecepcionEstado } from '../controllers/recepcionesController.js';

const router = express.Router();

router.get('/', getRecepciones);
router.post('/', postRecepcion);
router.delete('/:id', deleteRecepcion);
router.put('/:id/estado', putRecepcionEstado);

export default router;
