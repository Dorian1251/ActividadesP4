const express = require('express');
const gruposController = require('../controllers/gruposController');
const { validarGrupo, validarIdParam, validarPaginacion, validarUsuarioIdParam } = require('../middlewares/validators');

const router = express.Router();

router.get('/', validarPaginacion, gruposController.obtenerGrupos);
router.get('/materia/:materia', gruposController.obtenerGruposPorMateria);
router.get('/:id', validarIdParam, gruposController.obtenerGrupoPorId);
router.post('/', validarGrupo, gruposController.crearGrupo);
router.post('/:id/integrantes', validarIdParam, gruposController.agregarIntegrante);
router.put('/:id', validarIdParam, gruposController.actualizarGrupo);
router.delete('/:id/integrantes/:usuarioId', validarUsuarioIdParam, gruposController.quitarIntegrante);
router.delete('/:id', validarIdParam, gruposController.eliminarGrupo);

module.exports = router;
