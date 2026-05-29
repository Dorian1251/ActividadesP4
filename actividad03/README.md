# Actividad 03 - StudySync Integrado

## Descripcion

Esta actividad integra los entregables anteriores de StudySync en una arquitectura funcional con persistencia real y comunicacion en tiempo real.

La API REST ya no guarda los datos en arreglos en memoria. Ahora utiliza Prisma ORM para conectarse a una base de datos PostgreSQL en Supabase. Ademas, cuando se crean datos importantes, la API publica eventos en Redis Pub/Sub usando Upstash. Esos eventos son recibidos por un suscriptor Redis integrado y enviados al navegador mediante Socket.io.

## Objetivo

Demostrar una arquitectura donde:

- El cliente realiza peticiones HTTP a una API REST.
- La API guarda datos reales en Supabase PostgreSQL.
- La API publica eventos en Redis Pub/Sub.
- El suscriptor recibe eventos en tiempo real.
- Socket.io muestra las notificaciones en una interfaz web sin recargar la pagina.

## Arquitectura

```text
Thunder Client / Swagger
        |
        v
API REST Express
        |
        v
Prisma ORM
        |
        v
Supabase PostgreSQL
        |
        v
Redis Pub/Sub Upstash
        |
        v
Subscriber Redis
        |
        v
Socket.io
        |
        v
Panel web de notificaciones
```

## Componentes principales

### API REST

La API esta construida con Node.js y Express. Expone endpoints para las entidades principales de StudySync:

- Usuarios
- Materias
- Grupos
- Sesiones
- Recursos

### Prisma ORM

Prisma se utiliza como ORM para comunicarse con Supabase PostgreSQL. Reemplaza el uso de arreglos en memoria y permite que los datos persistan aunque el servidor se reinicie.

### Supabase PostgreSQL

Supabase funciona como base de datos real en la nube. Las tablas se crean a partir del archivo:

```text
api-service/prisma/schema.prisma
```

### Redis Pub/Sub

Redis Pub/Sub se utiliza como broker de mensajeria. Cuando ocurre una accion importante, la API publica un evento en un canal Redis.

### Redis Cache

Redis tambien se utiliza como cache para lecturas frecuentes. La cache guarda temporalmente respuestas de listados para reducir consultas repetidas a Supabase.

Endpoints con cache:

```text
GET /api/usuarios
GET /api/materias
GET /api/grupos
GET /api/sesiones
GET /api/recursos
```

Cada respuesta se guarda con una clave que incluye los filtros de la consulta. Ejemplo:

```text
cache:sesiones:{"fecha":"2026-05-28","limit":"10","page":"1"}
```

La cache tiene TTL de 60 segundos. Ademas, cuando se ejecuta `POST`, `PUT` o `DELETE`, la API invalida las claves `cache:*` para evitar datos desactualizados.

Los usos de Redis estan separados:

```text
cache:* -> cache de lecturas
study:* -> canales Pub/Sub de eventos
```

### Socket.io

Socket.io permite enviar los eventos recibidos desde Redis a los navegadores conectados en tiempo real.

## Estructura del proyecto

```text
actividad03/
  README.md
  api-service/
    package.json
    prisma.config.ts
    prisma/
      schema.prisma
    public/
      notificaciones.html
    src/
      server.js
      config/
        db.js
      controllers/
        usuariosController.js
        materiasController.js
        gruposController.js
        sesionesController.js
        recursosController.js
      routes/
        usuariosRoutes.js
        materiasRoutes.js
        gruposRoutes.js
        sesionesRoutes.js
        recursosRoutes.js
      services/
        redisPublisher.js
        redisSubscriber.js
      middlewares/
        errorHandler.js
      utils/
        request.js
      swagger.js
```

## Variables de entorno

Crear un archivo `.env` dentro de:

```text
actividad03/api-service/.env
```

Contenido requerido:

```env
DATABASE_URL=postgresql://usuario:password@host:5432/postgres
REDIS_URL=redis://default:password@host:6379
PORT=3000
```

Importante:

- `.env` no debe subirse a GitHub.
- `DATABASE_URL` debe usar la URL de Supabase, preferiblemente la de Session Pooler.
- `REDIS_URL` debe ser la URL TCP de Upstash Redis.

## Instalacion local

Entrar a la carpeta del servicio:

```bash
cd actividad03/api-service
```

Instalar dependencias:

```bash
npm install
```

Generar Prisma Client:

```bash
npx prisma generate
```

Sincronizar tablas con Supabase:

```bash
npx prisma db push
```

Iniciar servidor:

```bash
npm start
```

El servidor queda disponible en:

```text
http://localhost:3000
```

## Pruebas automatizadas

La actividad incluye una suite basica con Jest y Supertest.

Archivo principal:

```text
api-service/tests/api.validation.test.js
```

Ejecutar pruebas:

```bash
cd actividad03/api-service
npm test
```

La suite valida:

- `GET /` responde correctamente.
- `POST /api/usuarios` responde 400 si falta `nombre`.
- `POST /api/materias` responde 400 si falta `codigo`.
- `POST /api/grupos` responde 400 si falta `materiaId`.
- `POST /api/sesiones` responde 400 si falta `usuarioId`.
- `POST /api/recursos` responde 400 si falta `url`.

Estas pruebas usan mocks de Prisma y Redis para no depender de Supabase ni crear datos reales durante la ejecucion automatizada.

## Interfaces disponibles

Swagger:

```text
http://localhost:3000/api-docs
```

Panel de notificaciones:

```text
http://localhost:3000/notificaciones
```

Endpoint raiz:

```text
http://localhost:3000
```

## Entidades de la base de datos

### Usuario

Representa a los estudiantes u organizadores del sistema.

Campos principales:

- id
- nombre
- email
- rol

Relaciones:

- Puede crear sesiones.
- Puede publicar recursos.
- Puede organizar grupos.
- Puede pertenecer a grupos.

### Materia

Representa una asignatura o curso.

Campos principales:

- id
- nombre
- codigo
- docente
- semestre

Relaciones:

- Tiene sesiones.
- Tiene recursos.
- Tiene grupos.

### Grupo

Representa un grupo de estudio.

Campos principales:

- id
- nombre
- descripcion
- materiaId
- organizadorId

Relaciones:

- Pertenece a una materia.
- Tiene un organizador.
- Tiene integrantes.

### Sesion

Representa una sesion de estudio.

Campos principales:

- id
- titulo
- descripcion
- fecha
- hora
- modalidad
- usuarioId
- materiaId

Relaciones:

- Pertenece a un usuario.
- Pertenece a una materia.

### Recurso

Representa material de estudio publicado.

Campos principales:

- id
- titulo
- tipo
- url
- descripcion
- usuarioId
- materiaId

Relaciones:

- Pertenece a un usuario.
- Pertenece a una materia.

## Migraciones e indices justificados

La base de datos fue creada inicialmente con Prisma y Supabase. Para documentar cambios estructurales se incluye una migracion SQL en:

```text
api-service/prisma/migrations/20260528130000_agregar_indices_consultas_frecuentes/migration.sql
```

Esta migracion agrega indices para optimizar consultas frecuentes de la API.

| Tabla | Indice | Justificacion |
|---|---|---|
| `Usuario` | `rol` | Se usa en `GET /api/usuarios?rol=...` y `GET /api/usuarios/rol/:rol`. |
| `Materia` | `semestre` | Se usa en `GET /api/materias?semestre=...` y `GET /api/materias/semestre/:semestre`. |
| `Grupo` | `materiaId` | Se usa al filtrar grupos por materia. |
| `Grupo` | `organizadorId` | Optimiza consultas relacionadas al organizador del grupo. |
| `Sesion` | `fecha` | Se usa en `GET /api/sesiones/fecha/:fecha`. |
| `Sesion` | `materiaId` | Se usa al listar sesiones por materia. |
| `Sesion` | `usuarioId` | Optimiza la relacion entre sesiones y usuarios. |
| `Recurso` | `tipo` | Se usa en `GET /api/recursos?tipo=...` y `GET /api/recursos/tipo/:tipo`. |
| `Recurso` | `materiaId` | Optimiza recursos filtrados por materia. |
| `Recurso` | `usuarioId` | Optimiza recursos filtrados o relacionados por usuario. |

La migracion usa `CREATE INDEX IF NOT EXISTS`, por lo que se puede ejecutar de forma segura sin duplicar indices existentes.

### Aplicar indices en Supabase

Opcion recomendada:

1. Abrir Supabase.
2. Ir a `SQL Editor`.
3. Copiar el contenido de `migration.sql`.
4. Ejecutar el script.
5. Verificar los indices en `Database -> Indexes`.

No se recomienda usar `prisma migrate reset` porque elimina los datos de la base.

## Endpoints principales

### Usuarios

```text
GET    /api/usuarios
GET    /api/usuarios?q=ana&rol=estudiante&page=1&limit=10
GET    /api/usuarios/:id
GET    /api/usuarios/rol/:rol
GET    /api/usuarios/:id/grupos
POST   /api/usuarios
PUT    /api/usuarios/:id
DELETE /api/usuarios/:id
```

Ejemplo POST:

```json
{
  "nombre": "Ana Perez",
  "email": "ana03@gmail.com",
  "rol": "estudiante"
}
```

### Materias

```text
GET    /api/materias
GET    /api/materias?q=prog&semestre=4&page=1&limit=10
GET    /api/materias/:id
GET    /api/materias/semestre/:semestre
GET    /api/materias/:id/sesiones
POST   /api/materias
PUT    /api/materias/:id
DELETE /api/materias/:id
```

Ejemplo POST:

```json
{
  "nombre": "Programacion IV",
  "codigo": "PROG4",
  "docente": "Ing. Ramirez",
  "semestre": "4"
}
```

### Grupos

```text
GET    /api/grupos
GET    /api/grupos?q=redis&materia=PROG4&page=1&limit=10
GET    /api/grupos/:id
GET    /api/grupos/materia/:materia
POST   /api/grupos
POST   /api/grupos/:id/integrantes
PUT    /api/grupos/:id
DELETE /api/grupos/:id/integrantes/:usuarioId
DELETE /api/grupos/:id
```

Ejemplo POST grupo:

```json
{
  "nombre": "Grupo Redis",
  "descripcion": "Grupo de estudio en tiempo real",
  "materiaId": 1,
  "organizadorId": 1
}
```

Ejemplo agregar integrante:

```json
{
  "usuarioId": 2
}
```

### Sesiones

```text
GET    /api/sesiones
GET    /api/sesiones?q=redis&materia=PROG4&fecha=2026-05-28&page=1&limit=10
GET    /api/sesiones/:id
GET    /api/sesiones/materia/:materia
GET    /api/sesiones/fecha/:fecha
POST   /api/sesiones
PUT    /api/sesiones/:id
DELETE /api/sesiones/:id
```

Ejemplo POST:

```json
{
  "titulo": "Sesion Redis con Supabase",
  "descripcion": "Prueba completa de Actividad 03",
  "fecha": "2026-05-28",
  "hora": "18:00",
  "modalidad": "virtual",
  "usuarioId": 1,
  "materiaId": 1
}
```

### Recursos

```text
GET    /api/recursos
GET    /api/recursos?q=prisma&tipo=PDF&page=1&limit=10
GET    /api/recursos/:id
GET    /api/recursos/tipo/:tipo
GET    /api/recursos/buscar/:titulo
POST   /api/recursos
PUT    /api/recursos/:id
DELETE /api/recursos/:id
```

Ejemplo POST:

```json
{
  "titulo": "Guia Prisma",
  "tipo": "PDF",
  "url": "https://example.com/guia-prisma.pdf",
  "descripcion": "Material de apoyo",
  "usuarioId": 1,
  "materiaId": 1
}
```

## Eventos Redis Pub/Sub

La API publica eventos cuando ocurren acciones importantes.

| Accion | Evento | Canal Redis |
|---|---|---|
| Crear usuario | `usuario.registrado` | `study:usuario:registrado` |
| Crear materia | `materia.creada` | `study:materia:creada` |
| Crear sesion | `sesion.creada` | `study:sesion:creada` |
| Publicar recurso | `recurso.publicado` | `study:recurso:publicado` |
| Usuario se une a grupo | `usuario.unido` | `study:usuario:unido` |

Estructura del mensaje:

```json
{
  "tipo": "sesion.creada",
  "payload": {
    "id": 1,
    "titulo": "Sesion Redis con Supabase"
  },
  "timestamp": "2026-05-28T10:00:00.000Z",
  "version": "1.0"
}
```

## Flujo de integracion

Ejemplo con una sesion:

```text
1. El usuario hace POST /api/sesiones desde Swagger.
2. Express recibe la peticion.
3. Prisma ejecuta prisma.sesion.create().
4. Supabase guarda la sesion.
5. La API publica sesion.creada en Redis.
6. El suscriptor Redis escucha study:*.
7. Socket.io emite nuevo-evento.
8. La pagina /notificaciones muestra la tarjeta sin recargar.
```

## Pruebas de integracion

### Crear registros

Crear al menos:

- 1 usuario
- 1 materia
- 1 sesion

Luego verificar en Supabase:

```text
Supabase Dashboard -> Table Editor
```

Las tablas deben mostrar los registros creados.

### Persistencia

1. Crear datos desde Swagger o Thunder Client.
2. Detener el servidor con `Ctrl + C`.
3. Volver a iniciar con `npm start`.
4. Ejecutar:

```text
GET /api/usuarios
GET /api/materias
GET /api/sesiones
```

Los datos deben seguir disponibles porque estan guardados en Supabase.

### Redis Pub/Sub

Con el servidor activo y `/notificaciones` abierto, crear una sesion:

```text
POST /api/sesiones
```

Resultado esperado en consola:

```text
[Redis Pub] Evento publicado en study:sesion:creada: sesion.creada
[Redis Sub] Recibido en study:sesion:creada: sesion.creada
[Socket.io] Evento enviado a 1 cliente(s)
```

Resultado esperado en navegador:

```text
Tarjeta con canal study:sesion:creada y tipo sesion.creada
```
### Por que Redis y no solo la base de datos

Supabase PostgreSQL se utiliza para guardar datos persistentes, pero la base de datos no debe usarse como mecanismo principal de notificaciones en tiempo real. Si solo se usara la base de datos, los clientes tendrian que consultar constantemente si existen cambios nuevos, lo que se conoce como polling.

Redis Pub/Sub permite que la API publique un evento justo cuando ocurre una accion importante, como crear una sesion o publicar un recurso. Los servicios suscriptores reciben el evento inmediatamente sin consultar repetidamente la base de datos.

Esto mejora la arquitectura porque:

- Desacopla la API de los suscriptores.
- Reduce consultas innecesarias a Supabase.
- Permite notificaciones en tiempo real.
- Facilita que varios servicios reaccionen al mismo evento.
- Mantiene a Supabase como sistema de persistencia y a Redis como sistema de mensajeria.

En esta actividad, Supabase guarda la verdad de los datos y Redis comunica los cambios en tiempo real.

## Despliegue en Render

Crear un nuevo Web Service en Render.

Configuracion recomendada:

```text
Root Directory: actividad03/api-service
Build Command: npm install && npm run build
Start Command: npm start
```

Variables de entorno en Render:

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

Despues del despliegue:

```text
https://TU-SERVICIO.onrender.com/api-docs
https://TU-SERVICIO.onrender.com/notificaciones
```

## Evidencias recomendadas

Para el informe o defensa, guardar capturas de:

- Swagger creando usuario, materia y sesion.
- Supabase Table Editor mostrando los registros.
- Terminal mostrando `[Redis Pub]` y `[Redis Sub]`.
- Pagina `/notificaciones` mostrando las tarjetas.
- Prueba despues de reiniciar el servidor mostrando que los datos persisten.
- Configuracion de Render con variables de entorno ocultando valores sensibles.

## Seguridad

- No subir `.env` a GitHub.
- No copiar `DATABASE_URL` ni `REDIS_URL` dentro del codigo.
- Si una credencial se sube por error, cambiar la contraseña en Supabase o Upstash.

## Conclusiones

La Actividad 03 demuestra la integracion de una API REST con una base de datos real y un sistema de mensajeria en tiempo real. StudySync ahora puede guardar datos persistentes en Supabase, publicar eventos en Redis y mostrar notificaciones instantaneas mediante Socket.io.
