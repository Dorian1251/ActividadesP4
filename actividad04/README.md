# Actividad 04 - StudySync JWT + Swagger + Frontend + Asistencia QR

## Descripcion

Esta actividad agrega seguridad, documentacion profesional y una interfaz web a StudySync.

El sistema permite que los usuarios se registren, inicien sesion con JWT, usen rutas privadas, administren entidades desde un panel Bootstrap y registren asistencia a sesiones mediante codigo QR.

La API mantiene la integracion con Supabase PostgreSQL, Prisma ORM, Redis Upstash, Socket.io y Swagger/OpenAPI.

## Mejoras UX/UI

- Dashboard con estadisticas reales: 4 tarjetas (proximas sesiones, % asistencia, materias, sesiones totales) y 2 listas (proximas sesiones, recursos recientes).
- Busqueda, filtros y paginacion con header `X-Total-Count`.
- Calendario visual con FullCalendar (mes/semana/lista) cargado por CDN.
- Tema claro/oscuro con toggle persistente en `localStorage`.
- Toasts y spinners nativos de Bootstrap 5.3, modal de confirmacion reemplazando `window.confirm`.
- Internacionalizacion espanol/ingles con switcher y persistencia.
- Responsive mobile en `qr.html`, `asistencia.html` y todo el panel.

## Funcionalidades implementadas

- Registro de usuarios con contrasena hasheada usando `bcryptjs`.
- Login con access token JWT y refresh token.
- Logout con blacklist de tokens en Redis usando TTL.
- Proteccion de rutas privadas con Bearer Token.
- Swagger/OpenAPI con boton `Authorize`.
- Seguridad adicional con Helmet, CORS, Rate Limiting, validaciones y sanitizacion de respuestas.
- Frontend web con Bootstrap.
- Menu para entidades: usuarios, materias, grupos, sesiones y recursos.
- Control de usuario propio: cada usuario solo puede ver, editar o eliminar su propio perfil.
- Control de asistencia por QR.
- Marcar y desmarcar asistencia.
- Notificaciones en tiempo real con Redis Pub/Sub y Socket.io.
- Infrastructure as Code con CloudFormation para S3, DynamoDB y SSM.

## Tecnologias utilizadas

- Node.js
- Express
- Prisma ORM
- Supabase PostgreSQL
- Redis Upstash
- Socket.io
- JSON Web Token
- bcryptjs
- qrcode
- Swagger/OpenAPI
- Bootstrap
- Helmet
- CORS
- express-rate-limit
- express-validator
- CloudFormation
- LocalStack

## Estructura principal

```text
actividad04/
├── api-service/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── public/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── index.html
│   │   ├── qr.html
│   │   ├── asistencia.html
│   │   └── *.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── swagger.js
│   └── package.json
└── cloudformation/
    └── template.yaml
```

## Variables de entorno

Crear el archivo:

```text
actividad04/api-service/.env
```

Variables necesarias:

```env
DATABASE_URL=postgresql://usuario:password@host:5432/postgres
REDIS_URL=rediss://default:password@host.upstash.io:6379
JWT_SECRET=clave_secreta_larga_y_segura_2026
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
CORS_ORIGIN=http://localhost:3000
PUBLIC_APP_URL=http://localhost:3000
```

Notas:

- `DATABASE_URL` conecta la API con Supabase.
- `REDIS_URL` usa Upstash para Pub/Sub, cache y blacklist de tokens.
- `JWT_SECRET` firma y verifica los tokens.
- `PUBLIC_APP_URL` se usa para generar enlaces correctos en los QR.
- En Render, `PUBLIC_APP_URL` debe ser la URL publica del servicio.
- El archivo `.env` no debe subirse a GitHub.

## Ejecutar localmente

Entrar al servicio:

```bash
cd actividad04/api-service
```

Instalar dependencias:

```bash
npm install
```

Generar Prisma Client:

```bash
npx prisma generate
```

Sincronizar Supabase:

```bash
npx prisma db push
```

Si Prisma muestra advertencia por indice unico de `codigoAsistencia`:

```bash
npx prisma db push --accept-data-loss
```

Iniciar servidor:

```bash
npm start
```

URLs principales:

```text
http://localhost:3000
http://localhost:3000/static/login.html
http://localhost:3000/static/register.html
http://localhost:3000/static/index.html
http://localhost:3000/api-docs
http://localhost:3000/notificaciones
```

## Frontend web

El frontend esta en:

```text
actividad04/api-service/public
```

Paginas principales:

| Pagina | Uso |
|---|---|
| `/static/register.html` | Registro de usuario |
| `/static/login.html` | Inicio de sesion |
| `/static/index.html` | Panel principal Bootstrap |
| `/static/qr.html` | Generar/mostrar QR de una sesion |
| `/static/asistencia.html` | Marcar o desmarcar asistencia |
| `/notificaciones` | Vista de eventos Socket.io |

El panel principal permite administrar:

- Mi perfil.
- Materias.
- Grupos.
- Sesiones.
- Recursos.
- QR de asistencia.
- Asistentes por sesion.
- Notificaciones en tiempo real.

## Autenticacion JWT

### Registro

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

La contrasena se guarda hasheada con `bcryptjs`.

### Login

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

Respuesta:

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

### Rutas privadas

Todas las rutas `/api` requieren:

```text
Authorization: Bearer ACCESS_TOKEN
```

Sin token:

```json
{
  "error": "Token requerido"
}
```

Token expirado:

```json
{
  "error": "Token expirado, inicia sesion nuevamente"
}
```

## Refresh token

Permite renovar el access token sin volver a ingresar email y contrasena.

```text
POST /auth/refresh
```

Body:

```json
{
  "refreshToken": "PEGAR_REFRESH_TOKEN"
}
```

Respuesta:

```json
{
  "mensaje": "Token renovado correctamente",
  "token": "NUEVO_ACCESS_TOKEN",
  "tipo": "Bearer",
  "expiraEn": "1h"
}
```

## Logout con blacklist Redis

```text
POST /auth/logout
```

Header:

```text
Authorization: Bearer ACCESS_TOKEN
```

El token se guarda en Redis con TTL hasta su expiracion natural.

Luego, si se intenta usar el mismo token:

```json
{
  "error": "Token invalidado. Inicia sesion nuevamente"
}
```

## Control de usuario propio

La entidad `Usuarios` funciona como `Mi perfil`.

Reglas:

- El usuario solo ve su propio perfil.
- El usuario solo puede actualizar su propio usuario.
- El usuario solo puede eliminar su propia cuenta.
- No puede editar ni eliminar otros usuarios aunque use Swagger o Thunder Client.
- Crear usuarios desde `/api/usuarios` esta bloqueado; se debe usar `/auth/register`.

Ejemplo de proteccion:

```text
PUT /api/usuarios/99
```

Si el token pertenece al usuario 4:

```json
{
  "error": "Solo puedes actualizar tu propio usuario"
}
```

## Entidades principales

### Materias

```text
GET    /api/materias
POST   /api/materias
GET    /api/materias/:id
PUT    /api/materias/:id
DELETE /api/materias/:id
```

Ejemplo:

```json
{
  "nombre": "Programacion IV",
  "codigo": "PROG4-A04",
  "docente": "Ing. Ramirez",
  "semestre": "4"
}
```

### Sesiones

```text
GET    /api/sesiones
POST   /api/sesiones
GET    /api/sesiones/:id
PUT    /api/sesiones/:id
DELETE /api/sesiones/:id
```

Ejemplo:

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

No se envia `usuarioId`. La API usa:

```js
usuarioId = req.user.id
```

### Grupos

```text
GET    /api/grupos
POST   /api/grupos
POST   /api/grupos/:id/integrantes
PUT    /api/grupos/:id
DELETE /api/grupos/:id
```

### Recursos

```text
GET    /api/recursos
POST   /api/recursos
PUT    /api/recursos/:id
DELETE /api/recursos/:id
```

## Control de asistencia con QR

La asistencia se registra por usuario y sesion.

Modelo:

```prisma
model Asistencia {
  id        Int      @id @default(autoincrement())
  usuarioId Int
  sesionId  Int
  fechaHora DateTime @default(now())

  @@unique([usuarioId, sesionId])
}
```

La restriccion unica evita que un usuario marque dos veces la misma sesion.

### Endpoints de asistencia

Generar QR:

```text
GET /api/sesiones/:id/qr
```

Ver mi asistencia:

```text
GET /api/sesiones/:id/asistencia/mia
```

Marcar asistencia:

```text
POST /api/sesiones/:id/asistencia
```

Body:

```json
{
  "codigo": "CODIGO_DEL_QR"
}
```

Desmarcar asistencia:

```text
DELETE /api/sesiones/:id/asistencia
```

Listar asistentes:

```text
GET /api/sesiones/:id/asistencias
```

### Flujo QR

1. Iniciar sesion.
2. Entrar al panel.
3. Ir a `Sesiones`.
4. Presionar `QR`.
5. Mostrar o escanear el codigo QR.
6. El QR abre:

```text
/static/asistencia.html?sesionId=ID&codigo=CODIGO
```

7. Si el usuario ya inicio sesion, la asistencia se marca automaticamente.
8. Desde la misma pantalla puede desmarcar asistencia.

Para celular, en Render configurar:

```env
PUBLIC_APP_URL=https://tu-servicio.onrender.com
```

## Redis Pub/Sub + Socket.io

Eventos publicados:

```text
usuario.registrado
materia.creada
sesion.creada
recurso.publicado
usuario.unido
asistencia.marcada
asistencia.desmarcada
```

Canales usados:

```text
study:usuario:registrado
study:materia:creada
study:sesion:creada
study:recurso:publicado
study:usuario:unido
study:asistencia:marcada
study:asistencia:desmarcada
```

El suscriptor escucha:

```text
study:*
```

Cuando llega un evento, Socket.io lo envia al navegador con:

```text
nuevo-evento
```

## Swagger/OpenAPI

Swagger esta disponible en:

```text
http://localhost:3000/api-docs
```

Incluye:

- Auth.
- Usuarios.
- Materias.
- Grupos.
- Sesiones.
- Asistencias.
- Recursos.
- Bearer Auth.
- Ejemplos de body.
- Respuestas esperadas.

### Probar token en Swagger

1. Ejecutar `POST /auth/login`.
2. Copiar `token`.
3. Hacer clic en `Authorize`.
4. Pegar el token.

Evitar duplicar Bearer:

```text
Bearer Bearer TOKEN
```

Debe ser solo:

```text
Bearer TOKEN
```

o solo el token si Swagger ya agrega Bearer automaticamente.

## Medidas de seguridad

### Helmet

Agrega cabeceras HTTP de seguridad:

```text
x-frame-options
x-content-type-options
content-security-policy
strict-transport-security
```

### CORS

Controla que dominios pueden acceder a la API:

```env
CORS_ORIGIN=http://localhost:3000
```

En Render:

```env
CORS_ORIGIN=https://tu-servicio.onrender.com
```

### Rate limiting

Limites:

```text
General: 150 peticiones cada 15 minutos
Auth: 25 intentos cada 15 minutos
```

Si se supera:

```json
{
  "error": "Demasiadas peticiones. Intente nuevamente mas tarde."
}
```

### Validacion de datos

Se usa `express-validator` para validar body, params y query antes de llegar a los controladores.

Ejemplo:

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

### Sanitizacion

El middleware `sanitizeResponseMiddleware` elimina `password` de cualquier respuesta JSON.

## Infrastructure as Code

Archivo:

```text
cloudformation/template.yaml
```

Recursos definidos:

| Recurso | Servicio | Uso |
|---|---|---|
| `StudySyncBucket` | S3 | Archivos o materiales de estudio |
| `TablaEventos` | DynamoDB | Auditoria/eventos con TTL |
| `ParametroApiUrl` | SSM Parameter Store | URL centralizada de la API |

### Probar con LocalStack

```bash
aws --profile localstack --endpoint-url=http://localhost:4566 cloudformation create-stack --stack-name studysync-dev --template-body file://cloudformation/template.yaml --parameters ParameterKey=Ambiente,ParameterValue=dev ParameterKey=ApiUrl,ParameterValue=http://localhost:3000
```

Ver estado:

```bash
aws --profile localstack --endpoint-url=http://localhost:4566 cloudformation describe-stacks --stack-name studysync-dev
```

Resultado esperado:

```text
CREATE_COMPLETE
```

## Despliegue en Render

Configuracion:

```text
Root Directory: actividad04/api-service
Build Command: npm install && npx prisma generate
Start Command: npm start
```

Variables:

```env
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...
JWT_SECRET=clave_secreta_larga_y_segura_2026
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://tu-servicio.onrender.com
PUBLIC_APP_URL=https://tu-servicio.onrender.com
PORT=3000
```

URLs:

```text
https://tu-servicio.onrender.com
https://tu-servicio.onrender.com/static/login.html
https://tu-servicio.onrender.com/static/register.html
https://tu-servicio.onrender.com/static/index.html
https://tu-servicio.onrender.com/api-docs
```

## Prueba completa

1. Abrir `/static/register.html`.
2. Registrar usuario.
3. Iniciar sesion en `/static/login.html`.
4. Crear materia.
5. Crear sesion seleccionando materia desde el combobox.
6. Presionar `QR` en una sesion.
7. Escanear el QR desde celular.
8. Iniciar sesion en el celular si hace falta.
9. La asistencia se marca automaticamente.
10. Presionar `Desmarcar asistencia` para quitarla.
11. Volver al panel y presionar `Asistentes`.
12. Ver evento en notificaciones Socket.io.

## Requisitos estrategicos

| Requisito | Estado |
|---|---|
| Refresh token con expiracion correcta | Implementado |
| Logout con blacklist en Redis usando TTL | Implementado |
| Swagger con autenticacion Bearer | Implementado |
| Rate limiting + Helmet | Implementado |
| Frontend funcional | Implementado |
| Asistencia por QR | Implementado |
| Notificaciones en tiempo real | Implementado |
| IaC con CloudFormation | Implementado |

## Conclusion

StudySync ahora cuenta con autenticacion JWT, documentacion Swagger, frontend Bootstrap, proteccion de rutas, control de usuario propio, asistencia por QR, eventos en tiempo real con Redis/Socket.io e infraestructura declarativa con CloudFormation. Esto convierte la API en un sistema mas completo, seguro y facil de demostrar en vivo.
