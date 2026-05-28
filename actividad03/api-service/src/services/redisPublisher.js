const Redis = require('ioredis');

const CHANNELS = {
  SESION_CREADA: 'study:sesion:creada',
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
    publisher = new Redis(process.env.REDIS_URL);

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
