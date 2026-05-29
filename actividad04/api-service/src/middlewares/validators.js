const { body, param, query, validationResult } = require('express-validator');
 
const manejarValidaciones = (req, res, next) => {
  const errores = validationResult(req);
 
  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: 'Datos invalidos',
      detalles: errores.array().map((item) => ({
        campo: item.path,
        mensaje: item.msg
      }))
    });
  }
 
  next();
};
 
const validarIdParam = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un numero entero positivo'),
  manejarValidaciones
];
 
const validarUsuarioIdParam = [
  param('usuarioId').isInt({ min: 1 }).withMessage('El usuarioId debe ser un numero entero positivo'),
  manejarValidaciones
];
 
const validarRegistro = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().isEmail().withMessage('El email debe tener un formato valido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol').trim().notEmpty().withMessage('El rol es obligatorio'),
  manejarValidaciones
];
 
const validarLogin = [
  body('email').trim().isEmail().withMessage('El email debe tener un formato valido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  manejarValidaciones
];
 
const validarUsuario = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('email').trim().isEmail().withMessage('El email debe tener un formato valido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol').trim().notEmpty().withMessage('El rol es obligatorio'),
  manejarValidaciones
];
 
const validarMateria = [
  body('nombre').trim().notEmpty().withMessage('El nombre de la materia es obligatorio'),
  body('codigo').trim().notEmpty().withMessage('El codigo de la materia es obligatorio'),
  manejarValidaciones
];
 
const validarGrupo = [
  body('nombre').trim().notEmpty().withMessage('El nombre del grupo es obligatorio'),
  body('descripcion').trim().notEmpty().withMessage('La descripcion del grupo es obligatoria'),
  body('materiaId').isInt({ min: 1 }).withMessage('La materiaId debe ser un numero entero positivo'),
  manejarValidaciones
];
 
const validarSesion = [
  body('titulo').trim().notEmpty().withMessage('El titulo es obligatorio'),
  body('fecha').trim().notEmpty().withMessage('La fecha es obligatoria'),
  body('hora').trim().notEmpty().withMessage('La hora es obligatoria'),
  body('modalidad').trim().notEmpty().withMessage('La modalidad es obligatoria'),
  body('materiaId').isInt({ min: 1 }).withMessage('La materiaId debe ser un numero entero positivo'),
  manejarValidaciones
];
 
const validarRecurso = [
  body('titulo').trim().notEmpty().withMessage('El titulo es obligatorio'),
  body('tipo').trim().notEmpty().withMessage('El tipo es obligatorio'),
  body('url').trim().isURL().withMessage('La URL debe tener un formato valido'),
  body('materiaId').isInt({ min: 1 }).withMessage('La materiaId debe ser un numero entero positivo'),
  manejarValidaciones
];
 
const validarPaginacion = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un numero entero positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100'),
  manejarValidaciones
];
 
module.exports = {
  manejarValidaciones,
  validarGrupo,
  validarIdParam,
  validarLogin,
  validarMateria,
  validarPaginacion,
  validarRecurso,
  validarRegistro,
  validarSesion,
  validarUsuario,
  validarUsuarioIdParam
};
