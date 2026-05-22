const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuariosController');

router.get('/', ctrl.getAll);
router.get('/rol/:rol', ctrl.getByRol);
router.get('/:id/grupos', ctrl.getGruposById);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
