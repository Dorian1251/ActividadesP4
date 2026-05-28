const express = require('express');
const sesionesController = require('../controllers/sesionesController');

const router = express.Router();

router.get('/', sesionesController.obtenerSesiones);
router.get('/:id', sesionesController.obtenerSesionPorId);
router.post('/', sesionesController.crearSesion);
router.put('/:id', sesionesController.actualizarSesion);
router.delete('/:id', sesionesController.eliminarSesion);

module.exports = router;
