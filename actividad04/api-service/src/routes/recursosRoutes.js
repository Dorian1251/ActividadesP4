const express = require('express');
const recursosController = require('../controllers/recursosController');
const { validarIdParam, validarPaginacion, validarRecurso } = require('../middlewares/validators');

const router = express.Router();

router.get('/', validarPaginacion, recursosController.obtenerRecursos);
router.get('/tipo/:tipo', recursosController.obtenerRecursosPorTipo);
router.get('/buscar/:titulo', recursosController.buscarRecursosPorTitulo);
router.get('/:id', validarIdParam, recursosController.obtenerRecursoPorId);
router.post('/', validarRecurso, recursosController.crearRecurso);
router.put('/:id', validarIdParam, recursosController.actualizarRecurso);
router.delete('/:id', validarIdParam, recursosController.eliminarRecurso);

module.exports = router;
