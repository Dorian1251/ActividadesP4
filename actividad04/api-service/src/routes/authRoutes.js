const express = require('express');
const authController = require('../controllers/authController');
const { validarLogin, validarRegistro } = require('../middlewares/validators');
 
const router = express.Router();
 
router.post('/register', validarRegistro, authController.registrar);
router.post('/login', validarLogin, authController.login);
 
module.exports = router;
