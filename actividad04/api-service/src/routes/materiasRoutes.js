const express = require('express');
const materiasController = require('../controllers/materiasController');
const { validarIdParam, validarMateria, validarPaginacion } = require('../middlewares/validators');

const router = express.Router();

router.get('/', validarPaginacion, materiasController.obtenerMaterias);
router.get('/semestre/:semestre', materiasController.obtenerMateriasPorSemestre);
router.get('/:id/sesiones', validarIdParam, materiasController.obtenerSesionesDeMateria);
router.get('/:id', validarIdParam, materiasController.obtenerMateriaPorId);
router.post('/', validarMateria, materiasController.crearMateria);
router.put('/:id', validarIdParam, materiasController.actualizarMateria);
router.delete('/:id', validarIdParam, materiasController.eliminarMateria);

module.exports = router;
