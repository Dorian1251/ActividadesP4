const express = require('express');
const sesionesController = require('../controllers/sesionesController');
const { validarIdParam, validarPaginacion, validarSesion } = require('../middlewares/validators');

const router = express.Router();

router.get('/', validarPaginacion, sesionesController.obtenerSesiones);
router.get('/materia/:materia', sesionesController.obtenerSesionesPorMateria);
router.get('/fecha/:fecha', sesionesController.obtenerSesionesPorFecha);
router.get('/:id', validarIdParam, sesionesController.obtenerSesionPorId);
router.post('/', validarSesion, sesionesController.crearSesion);
router.put('/:id', validarIdParam, sesionesController.actualizarSesion);
router.delete('/:id', validarIdParam, sesionesController.eliminarSesion);

module.exports = router;
