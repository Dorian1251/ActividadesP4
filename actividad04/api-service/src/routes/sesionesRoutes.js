const express = require('express');
const asistenciasController = require('../controllers/asistenciasController');
const sesionesController = require('../controllers/sesionesController');
const { validarIdParam, validarPaginacion, validarSesion } = require('../middlewares/validators');

const router = express.Router();

router.get('/', validarPaginacion, sesionesController.obtenerSesiones);
router.get('/materia/:materia', sesionesController.obtenerSesionesPorMateria);
router.get('/fecha/:fecha', sesionesController.obtenerSesionesPorFecha);
router.get('/:id/qr', validarIdParam, asistenciasController.obtenerQrSesion);
router.get('/:id/asistencia/mia', validarIdParam, asistenciasController.obtenerMiAsistencia);
router.get('/:id/asistencias', validarIdParam, asistenciasController.listarAsistenciasDeSesion);
router.post('/:id/asistencia', validarIdParam, asistenciasController.marcarAsistencia);
router.delete('/:id/asistencia', validarIdParam, asistenciasController.desmarcarAsistencia);
router.get('/:id', validarIdParam, sesionesController.obtenerSesionPorId);
router.post('/', validarSesion, sesionesController.crearSesion);
router.put('/:id', validarIdParam, sesionesController.actualizarSesion);
router.delete('/:id', validarIdParam, sesionesController.eliminarSesion);

module.exports = router;
