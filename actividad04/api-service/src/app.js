const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const errorHandler = require('./middlewares/errorHandler');
const authMiddleware = require('./middlewares/authMiddleware');
const sanitizeResponseMiddleware = require('./middlewares/sanitizeResponseMiddleware');
 
const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const materiasRoutes = require('./routes/materiasRoutes');
const gruposRoutes = require('./routes/gruposRoutes');
const sesionesRoutes = require('./routes/sesionesRoutes');
const recursosRoutes = require('./routes/recursosRoutes');
 
const app = express();
 
const corsOrigen = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origen) => origen.trim())
  : '*';
 
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Intente nuevamente mas tarde.' }
});
 
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticacion. Intente nuevamente mas tarde.' }
});
 
app.use(helmet());
app.use(cors({
  origin: corsOrigen,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(generalLimiter);
app.use(express.json({ limit: '100kb' }));
app.use(sanitizeResponseMiddleware);
 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/static', express.static(path.join(__dirname, '../public')));
 
app.get('/', (req, res) => {
  res.json({
    mensaje: 'StudySync API Actividad 04 - API Segura con JWT + Swagger',
    entidades: ['usuarios', 'materias', 'grupos', 'sesiones', 'recursos'],
    autenticacion: {
      registro: '/auth/register',
      login: '/auth/login',
      tipo: 'Bearer Token'
    },
    seguridad: ['JWT', 'bcryptjs', 'Helmet', 'CORS', 'Rate Limit', 'Validaciones'],
    documentacion: '/api-docs',
    notificaciones: '/notificaciones'
  });
});
 
app.get('/notificaciones', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/notificaciones.html'));
});
 
app.use('/auth', authLimiter, authRoutes);
app.use('/api', authMiddleware);
 
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/sesiones', sesionesRoutes);
app.use('/api/recursos', recursosRoutes);
 
app.use(errorHandler);
 
module.exports = app;
