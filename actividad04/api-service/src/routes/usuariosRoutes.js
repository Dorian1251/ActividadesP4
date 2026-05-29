const express = require('express');
const usuariosController = require('../controllers/usuariosController');
const { validarIdParam, validarPaginacion, validarUsuario } = require('../middlewares/validators');

const router = express.Router();

router.get('/', validarPaginacion, usuariosController.obtenerUsuarios);
router.get('/rol/:rol', usuariosController.obtenerUsuariosPorRol);
router.get('/:id/grupos', validarIdParam, usuariosController.obtenerGruposDelUsuario);
router.get('/:id', validarIdParam, usuariosController.obtenerUsuarioPorId);
router.post('/', validarUsuario, usuariosController.crearUsuario);
router.put('/:id', validarIdParam, usuariosController.actualizarUsuario);
router.delete('/:id', validarIdParam, usuariosController.eliminarUsuario);

module.exports = router;
