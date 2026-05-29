const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { iniciarSuscriptorRedis } = require('./services/redisSubscriber');
 
dotenv.config();
 
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  transports: ['polling', 'websocket']
});
 
const usuariosConectados = new Map();
 
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
  console.log(`Servidor actividad04 corriendo en http://localhost:${PORT}`);
  console.log(`Swagger disponible en http://localhost:${PORT}/api-docs`);
  console.log(`Notificaciones en http://localhost:${PORT}/notificaciones`);
});
