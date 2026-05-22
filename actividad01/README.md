# StudySync API

API REST para el proyecto StudySync — Plataforma de coordinación de grupos de estudio.

## Entidades disponibles

- **Sesiones de estudio** — `/api/sesiones`
- **Usuarios** — `/api/usuarios`
- **Materias** — `/api/materias`
- **Grupos de estudio** — `/api/grupos`
- **Recursos compartidos** — `/api/recursos`

## Endpoints

| Método | Ruta | Descripción | Status |
|--------|------|-------------|--------|
| GET | `/{entidad}` | Listar todos los registros | 200 |
| GET | `/{entidad}/:id` | Obtener un registro por ID | 200 / 404 |
| POST | `/{entidad}` | Crear un nuevo registro | 201 / 400 |
| PUT | `/{entidad}/:id` | Actualizar un registro | 200 / 404 |
| DELETE | `/{entidad}/:id` | Eliminar un registro | 200 / 404 |

### Endpoints adicionales

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios/rol/:rol` | Listar usuarios por rol |
| GET | `/api/usuarios/:id/grupos` | Listar grupos de un usuario |
| GET | `/api/materias/semestre/:semestre` | Listar materias por semestre |
| GET | `/api/materias/:id/sesiones` | Listar sesiones de una materia |
| GET | `/api/grupos/materia/:materia` | Listar grupos por materia |
| POST | `/api/grupos/:id/integrantes` | Agregar un integrante a un grupo |
| GET | `/api/sesiones/materia/:materia` | Listar sesiones por materia |
| GET | `/api/sesiones/fecha/:fecha` | Listar sesiones por fecha |
| GET | `/api/recursos/tipo/:tipo` | Listar recursos por tipo |
| GET | `/api/recursos/buscar/:titulo` | Buscar recursos por título |

### Parámetros de consulta (GET)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `q` | string | Búsqueda por texto |
| `page` | number | Número de página (default: 1) |
| `limit` | number | Elementos por página (default: 10) |
| Filtros específicos | string | Dependen de la entidad |

## Ejemplos de uso

### Crear un usuario

```http
POST http://localhost:3000/api/usuarios
Content-Type: application/json
```

```json
{
  "nombre": "Ana",
  "email": "ana@gmail.com",
  "rol": "estudiante"
}
```

### Listar usuarios con paginación y búsqueda

```http
GET http://localhost:3000/api/usuarios?page=1&limit=10&q=ana
```

### Crear un grupo de estudio

```http
POST http://localhost:3000/api/grupos
Content-Type: application/json
```

```json
{
  "nombre": "Grupo Programacion",
  "materia": "Programacion",
  "integrantes": ["Ana", "Luis"]
}
```

### Agregar un integrante a un grupo

```http
POST http://localhost:3000/api/grupos/1/integrantes
Content-Type: application/json
```

```json
{
  "integrante": "Carlos"
}
```

## Instalación y uso local

```bash
npm install
npm start
```

El servidor iniciará en `http://localhost:3000`.

## Despliegue

**URL de producción:** *pendiente — configurar en Render o Railway*

## Stack

- Node.js + Express
- Datos en memoria (array)
- Patrón MVC
