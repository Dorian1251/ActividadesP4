const Redis = require('ioredis');

const DEFAULT_TTL_SECONDS = 300;
let cacheClient = null;

const obtenerCacheClient = () => {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!cacheClient) {
    cacheClient = new Redis(process.env.REDIS_URL);

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

  let data;

  try {
    data = await redis.get(key);
  } catch (error) {
    console.error(`[Redis Cache] No se pudo leer ${key}:`, error.message);
    return null;
  }

  if (!data) {
    console.log(`[Redis Cache] MISS ${key}`);
    return null;
  }

  console.log(`[Redis Cache] HIT ${key}`);
  return JSON.parse(data);
};

const guardarCache = async (key, value, ttl = DEFAULT_TTL_SECONDS) => {
  const redis = obtenerCacheClient();

  if (!redis) {
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

  let cursor = '0';
  let eliminadas = 0;

  do {
    try {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        eliminadas += keys.length;
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`[Redis Cache] No se pudo invalidar ${pattern}:`, error.message);
      return;
    }
  } while (cursor !== '0');

  console.log(`[Redis Cache] INVALIDATE ${pattern} (${eliminadas} clave(s))`);
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
