import express from 'express';
import {
  getCostos,
  createCosto,
  updateCosto,
  deleteCosto,
  getPagos,
  createPago,
  updatePago,
  deletePago,
  getResumen
} from '../controllers/finanzasController.js';

const router = express.Router();

router.get('/costos', getCostos);
router.post('/costos', createCosto);
router.put('/costos/:id', updateCosto);
router.delete('/costos/:id', deleteCosto);

router.get('/pagos', getPagos);
router.post('/pagos', createPago);
router.put('/pagos/:id', updatePago);
router.delete('/pagos/:id', deletePago);

router.get('/resumen', getResumen);
router.get('/finanzas/resumen', getResumen);

export default router;
