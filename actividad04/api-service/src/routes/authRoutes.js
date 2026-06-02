const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validarLogin, validarRegistro } = require('../middlewares/validators');
 
const router = express.Router();
 
router.post('/register', validarRegistro, authController.registrar);
router.post('/login', validarLogin, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authMiddleware, authController.logout);
 
module.exports = router;
