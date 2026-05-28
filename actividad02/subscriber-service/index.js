import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  transports: ['polling', 'websocket']
});
const usuariosConectados = new Map();

app.use(express.static(path.join(__dirname, 'public')));

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

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Interfaz disponible en http://localhost:${PORT}`);
});

const PATTERN = 'study:*';

const subscriber = new Redis(process.env.REDIS_URL);

subscriber.on('error', (error) => {
  console.error('Error Redis:', error.message);
});

await subscriber.psubscribe(PATTERN);

console.log('Subscriber Service - StudySync');
console.log(`Escuchando patron de canales: ${PATTERN}`);
console.log('Esperando mensajes...\n');

subscriber.on('pmessage', (pattern, channel, message) => {
  try {
    const evento = JSON.parse(message);
    const clientes = io.engine.clientsCount;

    io.emit('nuevo-evento', {
      canal: channel,
      clientes,
      ...evento
    });

    console.log(`[Socket.io] Evento enviado a ${clientes} cliente(s)`);
    

    console.log('====================================');
    console.log(`Patron: ${pattern}`);
    console.log(`Canal: ${channel}`);
    console.log(`Tipo de evento: ${evento.tipo}`);
    console.log(`Timestamp: ${evento.timestamp}`);
    console.log(`Version: ${evento.version}`);
    console.log('Payload:', evento.payload);

    if (evento.tipo === 'sesion.creada') {
      console.log(`Notificacion: Nueva sesion creada para ${evento.payload.materia}`);
    }

    if (evento.tipo === 'usuario.registrado') {
      console.log(`Notificacion: Nuevo usuario registrado: ${evento.payload.nombre}`);
    }

    if (evento.tipo === 'recurso.publicado') {
      console.log(`Notificacion: Nuevo recurso publicado para ${evento.payload.materia}`);
    }
    if (evento.tipo === 'usuario.unido') {
      console.log(`Notificacion: ${evento.payload.usuario} se unio al grupo ${evento.payload.grupo}`);
      console.log(`Alerta para organizador: ${evento.payload.organizador}`);
    }

    console.log('====================================\n');
  } catch (error) {
    console.error('Mensaje recibido no es JSON valido:', message);
  }
});
