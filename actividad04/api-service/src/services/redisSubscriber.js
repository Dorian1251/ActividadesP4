const Redis = require('ioredis');

const PATTERN = 'study:*';
const REDIS_OPTIONS = {
  connectTimeout: 5000,
  commandTimeout: 5000,
  enableOfflineQueue: false,
  lazyConnect: true,
  maxRetriesPerRequest: 1
};

const conectarRedis = async (redis) => {
  if (redis.status === 'ready') {
    return true;
  }

  try {
    if (redis.status === 'wait' || redis.status === 'end' || redis.status === 'close') {
      await redis.connect();
      return redis.status === 'ready';
    }

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Redis no conecto a tiempo'));
      }, 5000);

      const cleanup = () => {
        clearTimeout(timeout);
        redis.off('ready', onReady);
        redis.off('error', onError);
      };

      const onReady = () => {
        cleanup();
        resolve();
      };

      const onError = (error) => {
        cleanup();
        reject(error);
      };

      redis.once('ready', onReady);
      redis.once('error', onError);
    });

    return true;
  } catch (error) {
    console.error('[Redis Sub] Conexion no disponible:', error.message);
    return false;
  }
};

const iniciarSuscriptorRedis = async (io) => {
  if (!process.env.REDIS_URL) {
    console.warn('[Redis Sub] REDIS_URL no configurada. Socket.io funcionara sin eventos Redis.');
    return;
  }

  const subscriber = new Redis(process.env.REDIS_URL, REDIS_OPTIONS);

  subscriber.on('error', (error) => {
    console.error('[Redis Sub] Error:', error.message);
  });

  if (!await conectarRedis(subscriber)) {
    console.warn('[Redis Sub] No se pudo iniciar: Redis no conectado');
    return;
  }

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
