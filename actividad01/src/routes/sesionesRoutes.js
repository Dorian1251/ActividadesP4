const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sesionesController');

router.get('/', ctrl.getAll);
router.get('/materia/:materia', ctrl.getByMateria);
router.get('/fecha/:fecha', ctrl.getByFecha);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
