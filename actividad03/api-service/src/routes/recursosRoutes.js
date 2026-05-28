const express = require('express');
const recursosController = require('../controllers/recursosController');

const router = express.Router();

router.get('/', recursosController.obtenerRecursos);
router.get('/:id', recursosController.obtenerRecursoPorId);
router.post('/', recursosController.crearRecurso);
router.put('/:id', recursosController.actualizarRecurso);
router.delete('/:id', recursosController.eliminarRecurso);

module.exports = router;
