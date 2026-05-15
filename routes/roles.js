import express from 'express';
import {
  getRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol
} from '../controllers/rolesController.js';

const router = express.Router();

router.get('/', getRoles);
router.get('/:id', getRolById);
router.post('/', createRol);
router.put('/:id', updateRol);
router.delete('/:id', deleteRol);

export default router;
