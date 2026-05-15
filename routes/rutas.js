import express from 'express';
import { getRutas, getRutaById, createRuta, updateRuta, deleteRuta } from '../controllers/rutasController.js';

const router = express.Router();

router.get('/', getRutas);
router.get('/:id', getRutaById);
router.post('/', createRuta);
router.put('/:id', updateRuta);
router.delete('/:id', deleteRuta);

export default router;
