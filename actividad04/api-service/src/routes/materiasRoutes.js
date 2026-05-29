const express = require('express');
const materiasController = require('../controllers/materiasController');

const router = express.Router();

router.get('/', materiasController.obtenerMaterias);
router.get('/semestre/:semestre', materiasController.obtenerMateriasPorSemestre);
router.get('/:id/sesiones', materiasController.obtenerSesionesDeMateria);
router.get('/:id', materiasController.obtenerMateriaPorId);
router.post('/', materiasController.crearMateria);
router.put('/:id', materiasController.actualizarMateria);
router.delete('/:id', materiasController.eliminarMateria);

module.exports = router;
