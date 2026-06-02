const Redis = require('ioredis');

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
    console.error('[Redis Pub] Conexion no disponible:', error.message);
    return false;
  }
};

const CHANNELS = {
  ASISTENCIA_DESMARCADA: 'study:asistencia:desmarcada',
  ASISTENCIA_MARCADA: 'study:asistencia:marcada',
  SESION_CREADA: 'study:sesion:creada',
  MATERIA_CREADA: 'study:materia:creada',
  USUARIO_REGISTRADO: 'study:usuario:registrado',
  USUARIO_UNIDO: 'study:usuario:unido',
  RECURSO_PUBLICADO: 'study:recurso:publicado'
};

let publisher = null;

const obtenerPublisher = () => {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!publisher) {
    publisher = new Redis(process.env.REDIS_URL, REDIS_OPTIONS);

    publisher.on('error', (error) => {
      console.error('[Redis Pub] Error:', error.message);
    });
  }

  return publisher;
};

const publicarEvento = async (canal, tipo, payload) => {
  const redis = obtenerPublisher();

  if (!redis) {
    console.warn(`[Redis Pub] Evento no publicado (${tipo}): REDIS_URL no configurada`);
    return;
  }

  if (!await conectarRedis(redis)) {
    console.warn(`[Redis Pub] Evento no publicado (${tipo}): Redis no conectado`);
    return;
  }

  const evento = {
    tipo,
    payload,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };

  try {
    await redis.publish(canal, JSON.stringify(evento));
    console.log(`[Redis Pub] Evento publicado en ${canal}: ${tipo}`);
  } catch (error) {
    console.error(`[Redis Pub] No se pudo publicar ${tipo}:`, error.message);
  }
};

module.exports = {
  CHANNELS,
  publicarEvento
};
