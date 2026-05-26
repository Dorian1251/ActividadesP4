const Redis = require('ioredis');

const CHANNELS = {
    SESION_CREADA: 'study:sesion:creada',
    USUARIO_REGISTRADO: 'study:usuario:registrado',
    USUARIO_UNIDO: 'study:usuario:unido',
    RECURSO_PUBLICADO: 'study:recurso:publicado'
};

let redis = null;

const getRedis = () => {
    if (!process.env.REDIS_URL) {
        return null;
    }

    if (!redis) {
        redis = new Redis(process.env.REDIS_URL);
        redis.on('error', error => {
            console.error('Error Redis Publisher:', error.message);
        });
    }

    return redis;
};

const publicarEvento = async (canal, tipo, payload) => {
    const cliente = getRedis();

    if (!cliente) {
        console.warn(`Evento no publicado (${tipo}): REDIS_URL no configurada`);
        return false;
    }

    const evento = {
        tipo,
        payload,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };

    try {
        await cliente.publish(canal, JSON.stringify(evento));
        console.log(`Evento publicado en ${canal}:`, evento);
        return true;
    } catch (error) {
        console.error(`No se pudo publicar el evento ${tipo}:`, error.message);
        return false;
    }
};

module.exports = {
    CHANNELS,
    publicarEvento
};
