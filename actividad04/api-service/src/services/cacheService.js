const Redis = require('ioredis');

const DEFAULT_TTL_SECONDS = 300;
const REDIS_OPTIONS = {
  connectTimeout: 5000,
  commandTimeout: 5000,
  enableOfflineQueue: false,
  lazyConnect: true,
  maxRetriesPerRequest: 1
};
let cacheClient = null;

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
    console.error('[Redis Cache] Conexion no disponible:', error.message);
    return false;
  }
};

const obtenerCacheClient = () => {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!cacheClient) {
    cacheClient = new Redis(process.env.REDIS_URL, REDIS_OPTIONS);

    cacheClient.on('error', (error) => {
      console.error('[Redis Cache] Error:', error.message);
    });
  }

  return cacheClient;
};

const normalizarQuery = (query = {}) => {
  const entries = Object.entries(query)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify(Object.fromEntries(entries));
};

const crearCacheKey = (recurso, query = {}) => {
  return `cache:${recurso}:${normalizarQuery(query)}`;
};

const obtenerCache = async (key) => {
  const redis = obtenerCacheClient();

  if (!redis) {
    return null;
  }

  if (!await conectarRedis(redis)) {
    return null;
  }

  try {
    const data = await redis.get(key);

    if (!data) {
      console.log(`[Redis Cache] MISS ${key}`);
      return null;
    }

    console.log(`[Redis Cache] HIT ${key}`);
    return JSON.parse(data);
  } catch (error) {
    console.error(`[Redis Cache] No se pudo leer ${key}:`, error.message);
    return null;
  }
};

const guardarCache = async (key, value, ttl = DEFAULT_TTL_SECONDS) => {
  const redis = obtenerCacheClient();

  if (!redis) {
    return;
  }

  if (!await conectarRedis(redis)) {
    return;
  }

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
    console.log(`[Redis Cache] SET ${key} (${ttl}s)`);
  } catch (error) {
    console.error(`[Redis Cache] No se pudo guardar ${key}:`, error.message);
  }
};

const borrarCachePorPatron = async (pattern) => {
  const redis = obtenerCacheClient();

  if (!redis) {
    return;
  }

  if (!await conectarRedis(redis)) {
    return;
  }

  try {
    let cursor = '0';
    let eliminadas = 0;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        eliminadas += keys.length;
        await redis.del(...keys);
      }
    } while (cursor !== '0');

    console.log(`[Redis Cache] INVALIDATE ${pattern} (${eliminadas} clave(s))`);
  } catch (error) {
    console.error(`[Redis Cache] No se pudo invalidar ${pattern}:`, error.message);
  }
};

const borrarTodaCache = async () => {
  await borrarCachePorPatron('cache:*');
};

module.exports = {
  borrarCachePorPatron,
  borrarTodaCache,
  crearCacheKey,
  guardarCache,
  obtenerCache
};
