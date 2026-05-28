const express = require('express');
const gruposController = require('../controllers/gruposController');

const router = express.Router();

router.get('/', gruposController.obtenerGrupos);
router.get('/materia/:materia', gruposController.obtenerGruposPorMateria);
router.get('/:id', gruposController.obtenerGrupoPorId);
router.post('/', gruposController.crearGrupo);
router.post('/:id/integrantes', gruposController.agregarIntegrante);
router.put('/:id', gruposController.actualizarGrupo);
router.delete('/:id/integrantes/:usuarioId', gruposController.quitarIntegrante);
router.delete('/:id', gruposController.eliminarGrupo);

module.exports = router;
