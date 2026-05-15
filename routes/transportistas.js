import express from 'express';
import { getTransportistas, getTransportistaById, createTransportista, updateTransportista, deleteTransportista } from '../controllers/transportistasController.js';

const router = express.Router();

router.get('/', getTransportistas);
router.get('/:id', getTransportistaById);
router.post('/', createTransportista);
router.put('/:id', updateTransportista);
router.delete('/:id', deleteTransportista);

export default router;
