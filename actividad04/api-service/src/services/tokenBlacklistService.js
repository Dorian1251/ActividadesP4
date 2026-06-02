const Redis = require('ioredis');

let blacklistClient = null;

const obtenerBlacklistClient = () => {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!blacklistClient) {
    blacklistClient = new Redis(process.env.REDIS_URL);

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

  await redis.set(crearBlacklistKey(token), 'logout', 'EX', ttl);
  console.log(`[Redis Blacklist] Token invalidado (${ttl}s)`);
};

const tokenEstaEnBlacklist = async (token) => {
  const redis = obtenerBlacklistClient();

  if (!redis) {
    return false;
  }

  const existe = await redis.exists(crearBlacklistKey(token));
  return existe === 1;
};

module.exports = {
  agregarTokenABlacklist,
  tokenEstaEnBlacklist
};
