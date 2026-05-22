const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gruposController');

router.get('/', ctrl.getAll);
router.get('/materia/:materia', ctrl.getByMateria);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.post('/:id/integrantes', ctrl.addIntegrante);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
