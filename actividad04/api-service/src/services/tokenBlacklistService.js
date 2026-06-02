const Redis = require('ioredis');

const REDIS_OPTIONS = {
  connectTimeout: 5000,
  commandTimeout: 5000,
  enableOfflineQueue: false,
  lazyConnect: true,
  maxRetriesPerRequest: 1
};

let blacklistClient = null;

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
    console.error('[Redis Blacklist] Conexion no disponible:', error.message);
    return false;
  }
};

const obtenerBlacklistClient = () => {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!blacklistClient) {
    blacklistClient = new Redis(process.env.REDIS_URL, REDIS_OPTIONS);

    blacklistClient.on('error', (error) => {
      console.error('[Redis Blacklist] Error:', error.message);
    });
  }

  return blacklistClient;
};

const crearBlacklistKey = (token) => `blacklist:jwt:${token}`;

const calcularTtlDesdeExp = (exp) => {
  if (!exp) {
    return 0;
  }

  const ahora = Math.floor(Date.now() / 1000);
  return Math.max(exp - ahora, 0);
};

const agregarTokenABlacklist = async (token, exp) => {
  const redis = obtenerBlacklistClient();
  const ttl = calcularTtlDesdeExp(exp);

  if (!redis || ttl <= 0) {
    return;
  }

  if (!await conectarRedis(redis)) {
    return;
  }

  try {
    await redis.set(crearBlacklistKey(token), 'logout', 'EX', ttl);
    console.log(`[Redis Blacklist] Token invalidado (${ttl}s)`);
  } catch (error) {
    console.error('[Redis Blacklist] No se pudo invalidar token:', error.message);
  }
};

const tokenEstaEnBlacklist = async (token) => {
  const redis = obtenerBlacklistClient();

  if (!redis) {
    return false;
  }

  if (!await conectarRedis(redis)) {
    return false;
  }

  try {
    const existe = await redis.exists(crearBlacklistKey(token));
    return existe === 1;
  } catch (error) {
    console.error('[Redis Blacklist] No se pudo verificar token:', error.message);
    return false;
  }
};

module.exports = {
  agregarTokenABlacklist,
  tokenEstaEnBlacklist
};
