# Actividad 02 - StudySync Pub/Sub con Redis

Sistema de comunicacion asincrona en tiempo real entre servicios usando el patron Publicador-Suscriptor sobre Redis. El proyecto usa Upstash Redis como broker de mensajeria en la nube.

## Contexto

StudySync necesita notificaciones en tiempo real. Cuando se crea una sesion de estudio, cuando un usuario se une a un grupo o cuando se publica un recurso, otros servicios deben enterarse sin hacer una llamada directa entre ellos.

La comunicacion se realiza asi:

```text
Cliente HTTP
  -> publisher-service
  -> Upstash Redis Pub/Sub
  -> subscriber-service
```

El publicador no conoce al suscriptor. Ambos solo comparten el broker Redis y los nombres de los canales.

## Servicios

| Servicio | Responsabilidad |
|---|---|
| `publisher-service` | Expone endpoints HTTP y publica eventos en Redis cuando ocurre una accion de negocio. |
| `subscriber-service` | Se ejecuta en otro proceso, escucha canales Redis y muestra notificaciones en consola. |

## Tecnologias

- Node.js
- Express
- ioredis
- dotenv
- Upstash Redis
- Git y GitHub
- Thunder Client

## Variables de entorno

Crear el archivo:

```text
actividad02/.env
```

Contenido:

```env
REDIS_URL=rediss://default:TU_PASSWORD@TU_HOST:6379
PUBLISHER_PORT=3001
```

Importante: `.env` no debe subirse a GitHub. El archivo `.gitignore` debe incluir:

```gitignore
node_modules/
.env
```

## Canales Redis

El sistema usa multiples canales con logica diferenciada:

| Canal | Evento | Descripcion |
|---|---|---|
| `study:sesion:creada` | `sesion.creada` | Notifica cuando se crea una sesion de estudio. |
| `study:usuario:unido` | `usuario.unido` | Notifica cuando alguien se une a un grupo. |
| `study:recurso:publicado` | `recurso.publicado` | Notifica cuando se publica material nuevo. |

El suscriptor usa wildcard:

```js
subscriber.psubscribe('study:*');
```

Asi puede escuchar todos los canales que comienzan con `study:`.

## Estructura de mensajes

Todos los mensajes publicados en Redis usan la misma estructura JSON:

```json
{
  "tipo": "sesion.creada",
  "payload": {
    "id": 1,
    "titulo": "Repaso Redis PubSub",
    "materia": "Programacion IV",
    "creadoPor": "Ana"
  },
  "timestamp": "2026-05-26T00:00:00.000Z",
  "version": "1.0"
}
```

Campos:

| Campo | Descripcion |
|---|---|
| `tipo` | Nombre del evento de negocio. |
| `payload` | Datos relacionados con el evento. |
| `timestamp` | Fecha y hora en que se publico el evento. |
| `version` | Version del esquema del mensaje. |

## Endpoints del publicador

### Crear una sesion

```http
POST http://localhost:3001/sesiones
Content-Type: application/json
```

```json
{
  "titulo": "Repaso Redis PubSub",
  "materia": "Programacion IV",
  "creadoPor": "Ana"
}
```

Publica en:

```text
study:sesion:creada
```

### Registrar un usuario

```http
POST http://localhost:3001/usuarios
Content-Type: application/json
```

```json
{
  "nombre": "Carlos",
  "email": "carlos@gmail.com",
  "rol": "estudiante"
}
```

### Publicar un recurso

```http
POST http://localhost:3001/recursos
Content-Type: application/json
```

```json
{
  "titulo": "Guia Redis",
  "tipo": "pdf",
  "url": "https://example.com/redis",
  "materia": "Programacion IV"
}
```

Publica en:

```text
study:recurso:publicado
```

### Unirse a un grupo

```http
POST http://localhost:3001/grupos/unirse
Content-Type: application/json
```

```json
{
  "grupo": "Grupo Programacion",
  "usuario": "Carlos",
  "organizador": "Ana"
}
```

Publica en:

```text
study:usuario:unido
```

## Ejecucion local

Instalar dependencias del publicador:

```bash
cd actividad02/publisher-service
npm install
```

Instalar dependencias del suscriptor:

```bash
cd actividad02/subscriber-service
npm install
```

Terminal 1 - iniciar el suscriptor:

```bash
cd actividad02/subscriber-service
npm start
```

Debe mostrar:

```text
Subscriber Service - StudySync
Escuchando patron de canales: study:*
Esperando mensajes...
```

Terminal 2 - iniciar el publicador:

```bash
cd actividad02/publisher-service
npm start
```

Debe mostrar:

```text
Publisher Service corriendo en http://localhost:3001
```

Luego enviar peticiones desde Thunder Client a los endpoints del publicador. Los eventos deben aparecer automaticamente en la terminal del suscriptor.

## Demostracion en vivo

1. Abrir dos terminales en VS Code.
2. En la primera terminal ejecutar el `subscriber-service`.
3. En la segunda terminal ejecutar el `publisher-service`.
4. Enviar un `POST /sesiones` desde Thunder Client.
5. Verificar que el suscriptor recibe el evento `sesion.creada`.
6. Enviar un `POST /grupos/unirse`.
7. Verificar que el suscriptor recibe el evento `usuario.unido`.
8. Explicar que los servicios no se llaman directamente; Redis distribuye los mensajes.

## Latencia, limites y optimizacion

### Latencia

La latencia es el tiempo que pasa desde que el `publisher-service` publica un evento hasta que el `subscriber-service` lo recibe. En este proyecto depende de la conexion a internet, la region configurada en Upstash y la disponibilidad del servicio. Se uso Upstash en la region `US-East-1` para mantener una region estable y cercana.

### Limite del plan gratuito de Upstash

El plan gratuito de Upstash tiene un limite aproximado de 10.000 comandos por dia. En Pub/Sub, operaciones como `PUBLISH`, `PSUBSCRIBE`, conexiones y otros comandos Redis consumen parte de esa cuota. Durante la demostracion se deben evitar pruebas repetitivas innecesarias.

### Estrategias de optimizacion

- Usar canales especificos para evitar procesar mensajes que no interesan.
- Enviar solo los datos necesarios en el `payload`.
- Evitar publicar eventos duplicados.
- Agrupar eventos si se generan muchas notificaciones en poco tiempo.
- Mantener activos solo los servicios necesarios durante la demostracion.
- Filtrar por `tipo` de evento en el suscriptor para ejecutar solo la logica correspondiente.

## Evidencia para la entrega

- Captura de Upstash Redis con `PING -> PONG`.
- Captura del `publisher-service` corriendo.
- Captura del `subscriber-service` escuchando `study:*`.
- Captura de Thunder Client enviando `POST /sesiones`.
- Captura del suscriptor recibiendo el evento en tiempo real.
- Captura de GitHub con commits de ambos integrantes.
- Captura de Pull Request entre miembros del equipo.

## Integrantes y division de trabajo

| Integrante | Responsabilidad |
|---|---|
| Dorian | Implementacion del publicador y endpoints HTTP. |
| Camila | Implementacion del suscriptor y recepcion de eventos. |

## Requisitos estrategicos cubiertos

- Multiples canales con logica diferenciada.
- Mensajes con estructura JSON `{ tipo, payload, timestamp, version }`.
- Suscripcion con wildcard mediante `psubscribe('study:*')`.
- Explicacion de latencia, limite gratuito de Upstash y estrategias de optimizacion.
- Colaboracion en GitHub con commits identificables y Pull Requests.
