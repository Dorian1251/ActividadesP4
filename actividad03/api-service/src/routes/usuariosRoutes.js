const express = require('express');
const usuariosController = require('../controllers/usuariosController');

const router = express.Router();

router.get('/', usuariosController.obtenerUsuarios);
router.get('/rol/:rol', usuariosController.obtenerUsuariosPorRol);
router.get('/:id/grupos', usuariosController.obtenerGruposDelUsuario);
router.get('/:id', usuariosController.obtenerUsuarioPorId);
router.post('/', usuariosController.crearUsuario);
router.put('/:id', usuariosController.actualizarUsuario);
router.delete('/:id', usuariosController.eliminarUsuario);

module.exports = router;
