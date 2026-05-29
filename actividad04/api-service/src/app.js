const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const errorHandler = require('./middlewares/errorHandler');
const authMiddleware = require('./middlewares/authMiddleware');
 
const authRoutes = require('./routes/authRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const materiasRoutes = require('./routes/materiasRoutes');
const gruposRoutes = require('./routes/gruposRoutes');
const sesionesRoutes = require('./routes/sesionesRoutes');
const recursosRoutes = require('./routes/recursosRoutes');
 
const app = express();
 
app.use(express.json());
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
    documentacion: '/api-docs',
    notificaciones: '/notificaciones'
  });
});
 
app.get('/notificaciones', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/notificaciones.html'));
});
 
app.use('/auth', authRoutes);
 
app.use('/api', authMiddleware);
 
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/sesiones', sesionesRoutes);
app.use('/api/recursos', recursosRoutes);
 
app.use(errorHandler);
 
module.exports = app;
