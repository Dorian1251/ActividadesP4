const express = require('express');
const materiasController = require('../controllers/materiasController');

const router = express.Router();

router.get('/', materiasController.obtenerMaterias);
router.get('/:id', materiasController.obtenerMateriaPorId);
router.post('/', materiasController.crearMateria);
router.put('/:id', materiasController.actualizarMateria);
router.delete('/:id', materiasController.eliminarMateria);

module.exports = router;
