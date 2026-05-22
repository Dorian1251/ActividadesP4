const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/materiasController');

router.get('/', ctrl.getAll);
router.get('/semestre/:semestre', ctrl.getBySemestre);
router.get('/:id/sesiones', ctrl.getSesionesById);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
