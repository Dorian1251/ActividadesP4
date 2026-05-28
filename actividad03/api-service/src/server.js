const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const errorHandler = require('./middlewares/errorHandler');
const { iniciarSuscriptorRedis } = require('./services/redisSubscriber');

dotenv.config();

const usuariosRoutes = require('./routes/usuariosRoutes');
const materiasRoutes = require('./routes/materiasRoutes');
const gruposRoutes = require('./routes/gruposRoutes');
const sesionesRoutes = require('./routes/sesionesRoutes');
const recursosRoutes = require('./routes/recursosRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  transports: ['polling', 'websocket']
});
const usuariosConectados = new Map();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/static', express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.json({
    mensaje: 'StudySync API Actividad 03 - Supabase PostgreSQL + Redis Pub/Sub + Socket.io',
    entidades: ['usuarios', 'materias', 'grupos', 'sesiones', 'recursos'],
    documentacion: '/api-docs',
    notificaciones: '/notificaciones'
  });
});

app.get('/notificaciones', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/notificaciones.html'));
});

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/sesiones', sesionesRoutes);
app.use('/api/recursos', recursosRoutes);

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Cliente conectado: ${socket.id}`);

  socket.on('registrar-usuario', (nombre) => {
    const nombreLimpio = String(nombre || '').trim() || 'Invitado';
    usuariosConectados.set(socket.id, nombreLimpio);
    console.log(`[Socket.io] Usuario registrado: ${nombreLimpio} (${socket.id})`);
  });

  socket.on('disconnect', () => {
    const nombre = usuariosConectados.get(socket.id) || socket.id;
    usuariosConectados.delete(socket.id);
    console.log(`[Socket.io] Cliente desconectado: ${nombre}`);
  });
});

iniciarSuscriptorRedis(io).catch((error) => {
  console.error('[Redis Sub] No se pudo iniciar:', error.message);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor actividad03 corriendo en http://localhost:${PORT}`);
  console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
  console.log(`Notificaciones en http://localhost:${PORT}/notificaciones`);
});
