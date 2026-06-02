# Actividad 04 - JWT + Swagger

## Seguridad y Documentacion

Esta actividad agrega autenticacion, autorizacion y documentacion profesional a la API de StudySync.

La API ahora protege sus rutas privadas usando JSON Web Tokens (JWT). Los usuarios deben registrarse, iniciar sesion y enviar un token tipo Bearer para poder consultar, crear, actualizar o eliminar recursos protegidos.

Tambien se documenta la API con Swagger/OpenAPI para probar los endpoints desde el navegador.

## Objetivo

Implementar una API REST segura con:

- Registro de usuarios.
- Login con contrasena hasheada usando bcrypt.
- Access token JWT para rutas privadas.
- Refresh token para renovar el access token.
- Logout con blacklist de tokens en Redis usando TTL.
- Swagger con autenticacion Bearer.
- Medidas adicionales de seguridad: Helmet, CORS, Rate Limiting, validaciones y sanitizacion de respuestas.

## Tecnologias utilizadas

- Node.js
- Express
- Prisma ORM
- Supabase PostgreSQL
- JSON Web Token
- bcryptjs
- Redis Upstash
- Swagger/OpenAPI
- Helmet
- CORS
- express-rate-limit
- express-validator

## Variables de entorno

Crear el archivo:

```text
actividad04/api-service/.env
```

Variables necesarias:

```env
DATABASE_URL=postgresql://usuario:password@host:5432/postgres
REDIS_URL=redis://default:password@host:6379
JWT_SECRET=clave_secreta_larga_y_segura_2026
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

Notas:

- `JWT_SECRET` se usa para firmar y verificar tokens.
- `JWT_EXPIRES_IN` define la duracion del access token.
- `JWT_REFRESH_EXPIRES_IN` define la duracion del refresh token.
- `REDIS_URL` se usa para Pub/Sub, cache y blacklist de tokens.
- `.env` no debe subirse a GitHub.

## Ejecutar localmente

Entrar al servicio:

```bash
cd actividad04/api-service
```

Instalar dependencias:

```bash
npm install
```

Actualizar Supabase con Prisma:

```bash
npx prisma db push
```

Generar Prisma Client:

```bash
npx prisma generate
```

Iniciar servidor:

```bash
npm start
```

URLs principales:

```text
http://localhost:3000
http://localhost:3000/api-docs
http://localhost:3000/notificaciones
```

## Flujo de autenticacion

### 1. Registro

Endpoint:

```text
POST /auth/register
```

Body:

```json
{
  "nombre": "Dorian Escobar",
  "email": "dorian04@gmail.com",
  "password": "123456",
  "rol": "estudiante"
}
```

Resultado esperado:

```text
201 Created
```

La contrasena se guarda hasheada con bcrypt. La respuesta no expone el campo `password`.

### 2. Login

Endpoint:

```text
POST /auth/login
```

Body:

```json
{
  "email": "dorian04@gmail.com",
  "password": "123456"
}
```

Resultado esperado:

```json
{
  "mensaje": "Login correcto",
  "token": "ACCESS_TOKEN",
  "refreshToken": "REFRESH_TOKEN",
  "tipo": "Bearer",
  "expiraEn": "1h",
  "refreshExpiraEn": "7d"
}
```

El `token` se usa para acceder a rutas privadas.

El `refreshToken` se usa para pedir un nuevo access token sin volver a escribir email y contrasena.

### 3. Acceso a rutas privadas

Todas las rutas que empiezan con `/api` estan protegidas:

```text
GET    /api/usuarios
POST   /api/materias
POST   /api/sesiones
PUT    /api/sesiones/:id
DELETE /api/sesiones/:id
```

Header requerido:

```text
Authorization: Bearer ACCESS_TOKEN
```

Sin token:

```json
{
  "error": "Token requerido"
}
```

Con token invalido:

```json
{
  "error": "Token invalido"
}
```

Con token expirado:

```json
{
  "error": "Token expirado, inicia sesion nuevamente"
}
```

## Refresh token

El access token dura poco tiempo. Si expira, el usuario puede renovar su sesion con el refresh token.

Endpoint:

```text
POST /auth/refresh
```

Body:

```json
{
  "refreshToken": "PEGAR_REFRESH_TOKEN_AQUI"
}
```

Resultado esperado:

```json
{
  "mensaje": "Token renovado correctamente",
  "token": "NUEVO_ACCESS_TOKEN",
  "tipo": "Bearer",
  "expiraEn": "1h"
}
```

Si el refresh token expira:

```json
{
  "error": "Refresh token expirado, inicia sesion nuevamente"
}
```

## Logout con blacklist en Redis

Un JWT normalmente sigue siendo valido hasta que expire. Para cerrar sesion antes de la expiracion, el token se guarda en Redis dentro de una blacklist.

Endpoint:

```text
POST /auth/logout
```

Header:

```text
Authorization: Bearer ACCESS_TOKEN
```

Resultado esperado:

```json
{
  "mensaje": "Logout correcto. Token invalidado hasta su expiracion"
}
```

Luego, si se intenta usar el mismo token:

```json
{
  "error": "Token invalidado. Inicia sesion nuevamente"
}
```

Redis guarda el token con TTL. Esto significa que la clave se elimina automaticamente cuando el token ya habria expirado.

Ejemplo conceptual:

```text
blacklist:jwt:TOKEN -> TTL hasta la expiracion del token
```

## Swagger/OpenAPI

Swagger esta disponible en:

```text
http://localhost:3000/api-docs
```

La documentacion incluye:

- Endpoints de autenticacion.
- Endpoints privados de las entidades.
- Parametros.
- Body esperado.
- Respuestas posibles.
- Ejemplos.
- Autenticacion Bearer.

### Probar Bearer Token en Swagger

1. Ejecutar `POST /auth/login`.
2. Copiar el valor de `token`.
3. Hacer clic en `Authorize`.
4. Pegar el token.

Segun la configuracion de Swagger, puede pegarse solo el token:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Si no funciona, pegarlo con Bearer:

```text
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Nunca debe quedar duplicado:

```text
Bearer Bearer TOKEN
```

## Medidas de seguridad adicionales

### Helmet

Helmet agrega cabeceras HTTP de seguridad:

```js
app.use(helmet());
```

Ayuda contra riesgos comunes como clickjacking, sniffing de contenido y configuraciones inseguras del navegador.

Cabeceras esperadas:

```text
x-frame-options
x-content-type-options
content-security-policy
strict-transport-security
```

### CORS

CORS controla que dominios pueden llamar a la API:

```js
app.use(cors({
  origin: corsOrigen,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

En produccion no se recomienda usar `origin: '*'`. Se debe configurar:

```env
CORS_ORIGIN=https://tu-frontend.com
```

### Rate Limiting

La API limita peticiones por IP para reducir abuso:

```text
General: 150 peticiones cada 15 minutos
Auth: 25 intentos cada 15 minutos
```

Si se supera el limite:

```json
{
  "error": "Demasiadas peticiones. Intente nuevamente mas tarde."
}
```

Para login/register:

```json
{
  "error": "Demasiados intentos de autenticacion. Intente nuevamente mas tarde."
}
```

### Validacion de datos

Las rutas usan `express-validator` para validar body, params y query antes de llegar al controlador.

Ejemplo de error:

```json
{
  "error": "Datos invalidos",
  "detalles": [
    {
      "campo": "email",
      "mensaje": "El email debe tener un formato valido"
    }
  ]
}
```

### Sanitizacion de respuestas

El middleware `sanitizeResponseMiddleware` elimina `password` de cualquier respuesta JSON.

Esto evita exponer contrasenas hasheadas accidentalmente.

## Prueba completa desde cero

### 1. Registrar usuario

```text
POST /auth/register
```

```json
{
  "nombre": "Dorian Escobar",
  "email": "dorian04@gmail.com",
  "password": "123456",
  "rol": "estudiante"
}
```

### 2. Login

```text
POST /auth/login
```

```json
{
  "email": "dorian04@gmail.com",
  "password": "123456"
}
```

Guardar:

```text
ACCESS_TOKEN
REFRESH_TOKEN
```

### 3. Probar ruta privada sin token

```text
GET /api/sesiones
```

Resultado:

```text
401 Token requerido
```

### 4. Autorizar Swagger

Pegar el access token en `Authorize`.

### 5. Crear materia

```text
POST /api/materias
```

```json
{
  "nombre": "Programacion IV",
  "codigo": "PROG4-A04",
  "docente": "Ing. Ramirez",
  "semestre": "4"
}
```

### 6. Crear sesion segura

```text
POST /api/sesiones
```

```json
{
  "titulo": "Sesion segura con JWT",
  "descripcion": "Prueba Actividad 04",
  "fecha": "2026-06-01",
  "hora": "18:00",
  "modalidad": "virtual",
  "materiaId": 1
}
```

No se envia `usuarioId`. La API usa el usuario autenticado:

```js
usuarioId = req.user.id
```

### 7. Renovar token

```text
POST /auth/refresh
```

```json
{
  "refreshToken": "PEGAR_REFRESH_TOKEN"
}
```

Resultado:

```text
200 Token renovado correctamente
```

### 8. Logout

```text
POST /auth/logout
```

Header:

```text
Authorization: Bearer ACCESS_TOKEN
```

Resultado:

```text
200 Logout correcto
```

### 9. Probar token invalidado

Con el mismo token anterior:

```text
GET /api/sesiones
```

Resultado:

```text
401 Token invalidado. Inicia sesion nuevamente
```

## Requisitos estrategicos

| Requisito | Estado |
|---|---|
| Refresh token con expiracion correcta | Implementado |
| Logout con blacklist en Redis usando TTL | Implementado |
| Swagger con autenticacion Bearer | Implementado |
| Rate limiting + Helmet | Implementado |

## Despliegue en Render

Configuracion recomendada:

```text
Root Directory: actividad04/api-service
Build Command: npm install && npm run build
Start Command: npm start
```

Variables de entorno en Render:

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=clave_secreta_larga_y_segura_2026
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://tu-dominio.com
PORT=3000
```

## Conclusion

La Actividad 04 convierte StudySync en una API segura y documentada. JWT protege las rutas privadas, bcrypt protege las contrasenas, refresh token mantiene sesiones sin pedir credenciales nuevamente, Redis permite invalidar tokens con TTL en logout y Swagger permite probar la API completa desde `/api-docs`.
