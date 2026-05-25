const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

const CHANNEL = 'studysync:notificaciones';

const publicarEvento = async (tipo, payload) => {
    const evento = {
        tipo,
        payload,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };

    await redis.publish(CHANNEL, JSON.stringify(evento));

    console.log(`Evento publicado en ${CHANNEL}:`, evento);
};

module.exports = {
    publicarEvento,
    CHANNEL
};