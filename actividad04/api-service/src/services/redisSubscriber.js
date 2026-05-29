const Redis = require('ioredis');

const PATTERN = 'study:*';

const iniciarSuscriptorRedis = async (io) => {
  if (!process.env.REDIS_URL) {
    console.warn('[Redis Sub] REDIS_URL no configurada. Socket.io funcionara sin eventos Redis.');
    return;
  }

  const subscriber = new Redis(process.env.REDIS_URL);

  subscriber.on('error', (error) => {
    console.error('[Redis Sub] Error:', error.message);
  });

  await subscriber.psubscribe(PATTERN);

  console.log(`[Redis Sub] Escuchando patron: ${PATTERN}`);

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
      console.log(`[Redis Sub] Recibido en ${channel}: ${evento.tipo}`);
    } catch (error) {
      console.error('[Redis Sub] Mensaje no valido:', error.message);
    }
  });
};

module.exports = {
  iniciarSuscriptorRedis
};
