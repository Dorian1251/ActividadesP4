const express = require('express');
const recursosController = require('../controllers/recursosController');

const router = express.Router();

router.get('/', recursosController.obtenerRecursos);
router.get('/tipo/:tipo', recursosController.obtenerRecursosPorTipo);
router.get('/buscar/:titulo', recursosController.buscarRecursosPorTitulo);
router.get('/:id', recursosController.obtenerRecursoPorId);
router.post('/', recursosController.crearRecurso);
router.put('/:id', recursosController.actualizarRecurso);
router.delete('/:id', recursosController.eliminarRecurso);

module.exports = router;
