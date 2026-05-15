import express from 'express';
import {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
  ,
  // login handler will be imported below
} from '../controllers/usuariosController.js';
import { loginUsuario } from '../controllers/usuariosController.js';

const router = express.Router();

router.get('/', getUsuarios);
router.get('/:id', getUsuarioById);
router.post('/login', loginUsuario);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

export default router;
