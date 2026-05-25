import 'dotenv/config';
import { createClient } from 'redis';

const publisher = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true
    }
});

async function publicar() {

    await publisher.connect();

    await publisher.publish(
        'studysync:notificaciones',
        'Hola Camila 😭🔥 tu subscriber funciona'
    );

    console.log('Mensaje enviado');

    await publisher.quit();

}

publicar();