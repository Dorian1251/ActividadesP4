import 'dotenv/config';
import { createClient } from 'redis';

// Crear cliente de Redis usando la URL del .env
const subscriber = createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true // conexión segura (SSL/TLS)
    }
});

// Manejo de errores de conexión con Redis
subscriber.on('error', (err) => {
    console.log('Error Redis:', err);
});

// Función principal que inicia el suscriptor
async function startSubscriber() {

    // Conectar al servidor Redis
    await subscriber.connect();

    console.log('Suscriptor escuchando canal...');

    // Suscribirse al canal "studysync:notificaciones"
    // Cada vez que llegue un mensaje, se ejecuta esta función
    await subscriber.subscribe('studysync:notificaciones', (message) => {

        console.log('\nNotificación recibida:');
        console.log(message); // muestra el mensaje recibido

    });

}

// Ejecuta el subscriber al iniciar el archivo
startSubscriber();