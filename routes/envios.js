import express from 'express';
import { getEnvios, getEnvioById, createEnvio, updateEnvio, deleteEnvio } from '../controllers/enviosController.js';

const router = express.Router();

router.get('/', getEnvios);
router.get('/:id', getEnvioById);
router.post('/', createEnvio);
router.put('/:id', updateEnvio);
router.delete('/:id', deleteEnvio);

export default router;
