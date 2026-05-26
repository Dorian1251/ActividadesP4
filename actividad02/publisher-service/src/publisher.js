const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

const CHANNELS = {
    SESION_CREADA: 'study:sesion:creada',
    USUARIO_UNIDO: 'study:usuario:unido',
    RECURSO_PUBLICADO: 'study:recurso:publicado'
};

const publicarEvento = async (canal, tipo, payload) => {
    const evento = {
        tipo,
        payload,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };

    await redis.publish(canal, JSON.stringify(evento));

    console.log(`Evento publicado en ${canal}:`, evento);
};

module.exports = {
    publicarEvento,
    CHANNELS
};