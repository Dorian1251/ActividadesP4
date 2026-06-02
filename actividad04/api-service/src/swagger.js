const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'StudySync API Actividad 04',
    version: '1.0.0',
    description: 'API REST segura con JWT, Swagger/OpenAPI, Express, Prisma, Supabase PostgreSQL, Redis Pub/Sub, Socket.io y medidas adicionales de seguridad.'
  },
  servers: [
    {
      url: '/',
      description: 'Servidor actual'
    }
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Usuarios' },
    { name: 'Materias' },
    { name: 'Grupos' },
    { name: 'Sesiones' },
    { name: 'Recursos' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar usuario',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                nombre: 'Dorian Escobar',
                email: 'dorian@example.com',
                password: '123456',
                rol: 'estudiante'
              }
            }
          }
        },
        responses: {
          201: { description: 'Usuario registrado correctamente' },
          400: { description: 'Datos invalidos o email repetido' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesion',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                email: 'dorian@example.com',
                password: '123456'
              }
            }
          }
        },
        responses: {
          200: { description: 'Login correcto con access token y refresh token' },
          401: { description: 'Credenciales invalidas' }
        }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar access token usando refresh token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                refreshToken: 'PEGAR_REFRESH_TOKEN_AQUI'
              }
            }
          }
        },
        responses: {
          200: { description: 'Access token renovado correctamente' },
          400: { description: 'Falta refreshToken' },
          401: { description: 'Refresh token invalido o expirado' }
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Cerrar sesion e invalidar token JWT en Redis',
        responses: {
          200: { description: 'Logout correcto. Token agregado a blacklist con TTL' },
          401: { description: 'Token requerido, invalido o ya invalidado' }
        }
      }
    },
    '/api/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre' },
          { name: 'rol', in: 'query', schema: { type: 'string' }, description: 'Filtrar por rol' },
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } }
        ],
        responses: { 200: { description: 'Lista de usuarios' } }
      },
      post: {
        tags: ['Usuarios'],
        summary: 'Crear usuario y publicar usuario.registrado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { nombre: 'Ana Perez', email: 'ana03@gmail.com', rol: 'estudiante' }
            }
          }
        },
        responses: { 201: { description: 'Usuario creado' }, 400: { description: 'Datos invalidos' } }
      }
    },
    '/api/usuarios/rol/{rol}': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios por rol',
        parameters: [{ name: 'rol', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Usuarios filtrados por rol' } }
      }
    },
    '/api/usuarios/{id}/grupos': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar grupos donde participa un usuario',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Grupos del usuario' }, 404: { description: 'Usuario no encontrado' } }
      }
    },
    '/api/usuarios/{id}': {
      get: {
        tags: ['Usuarios'],
        summary: 'Obtener usuario por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Usuario encontrado' }, 404: { description: 'No encontrado' } }
      },
      put: {
        tags: ['Usuarios'],
        summary: 'Actualizar usuario',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: { 'application/json': { example: { nombre: 'Ana Actualizada', rol: 'organizador' } } }
        },
        responses: { 200: { description: 'Usuario actualizado' } }
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'Eliminar usuario',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Usuario eliminado' } }
      }
    },
    '/api/materias': {
      get: {
        tags: ['Materias'],
        summary: 'Listar materias',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre' },
          { name: 'semestre', in: 'query', schema: { type: 'string' }, description: 'Filtrar por semestre' },
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } }
        ],
        responses: { 200: { description: 'Lista de materias' } }
      },
      post: {
        tags: ['Materias'],
        summary: 'Crear materia y publicar materia.creada',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { nombre: 'Programacion IV', codigo: 'PROG4', docente: 'Ing. Ramirez', semestre: '4' }
            }
          }
        },
        responses: { 201: { description: 'Materia creada' } }
      }
    },
    '/api/materias/semestre/{semestre}': {
      get: {
        tags: ['Materias'],
        summary: 'Listar materias por semestre',
        parameters: [{ name: 'semestre', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Materias filtradas por semestre' } }
      }
    },
    '/api/materias/{id}/sesiones': {
      get: {
        tags: ['Materias'],
        summary: 'Listar sesiones de una materia',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Sesiones de la materia' }, 404: { description: 'Materia no encontrada' } }
      }
    },
    '/api/materias/{id}': {
      get: {
        tags: ['Materias'],
        summary: 'Obtener materia por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Materia encontrada' } }
      },
      put: {
        tags: ['Materias'],
        summary: 'Actualizar materia',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { example: { docente: 'Ing. Lopez' } } } },
        responses: { 200: { description: 'Materia actualizada' } }
      },
      delete: {
        tags: ['Materias'],
        summary: 'Eliminar materia',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Materia eliminada' } }
      }
    },
    '/api/grupos': {
      get: {
        tags: ['Grupos'],
        summary: 'Listar grupos',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Buscar por nombre' },
          { name: 'materia', in: 'query', schema: { type: 'string' }, description: 'Filtrar por materia: id, nombre o codigo' },
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } }
        ],
        responses: { 200: { description: 'Lista de grupos' } }
      },
      post: {
        tags: ['Grupos'],
        summary: 'Crear grupo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                nombre: 'Grupo Redis',
                descripcion: 'Grupo de estudio para Pub/Sub',
                materiaId: 1,
                organizadorId: 1
              }
            }
          }
        },
        responses: { 201: { description: 'Grupo creado' } }
      }
    },
    '/api/grupos/materia/{materia}': {
      get: {
        tags: ['Grupos'],
        summary: 'Listar grupos por materia',
        parameters: [{ name: 'materia', in: 'path', required: true, schema: { type: 'string' }, description: 'ID, nombre o codigo de materia' }],
        responses: { 200: { description: 'Grupos filtrados por materia' } }
      }
    },
    '/api/grupos/{id}': {
      get: {
        tags: ['Grupos'],
        summary: 'Obtener grupo por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Grupo encontrado' } }
      },
      put: {
        tags: ['Grupos'],
        summary: 'Actualizar grupo',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { example: { descripcion: 'Nueva descripcion' } } } },
        responses: { 200: { description: 'Grupo actualizado' } }
      },
      delete: {
        tags: ['Grupos'],
        summary: 'Eliminar grupo',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Grupo eliminado' } }
      }
    },
    '/api/grupos/{id}/integrantes': {
      post: {
        tags: ['Grupos'],
        summary: 'Agregar integrante y publicar usuario.unido',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { example: { usuarioId: 2 } } }
        },
        responses: { 200: { description: 'Integrante agregado' } }
      }
    },
    '/api/grupos/{id}/integrantes/{usuarioId}': {
      delete: {
        tags: ['Grupos'],
        summary: 'Quitar integrante',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'usuarioId', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: { 200: { description: 'Integrante quitado' } }
      }
    },
    '/api/sesiones': {
      get: {
        tags: ['Sesiones'],
        summary: 'Listar sesiones desde Supabase',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Buscar por titulo' },
          { name: 'materia', in: 'query', schema: { type: 'string' }, description: 'Filtrar por materia: id, nombre o codigo' },
          { name: 'fecha', in: 'query', schema: { type: 'string' }, description: 'Filtrar por fecha' },
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } }
        ],
        responses: { 200: { description: 'Lista de sesiones' } }
      },
      post: {
        tags: ['Sesiones'],
        summary: 'Crear sesion y publicar sesion.creada',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                titulo: 'Sesion con Supabase',
                descripcion: 'Prueba de persistencia',
                fecha: '2026-05-28',
                hora: '18:00',
                modalidad: 'virtual',
                usuarioId: 1,
                materiaId: 1
              }
            }
          }
        },
        responses: { 201: { description: 'Sesion creada' } }
      }
    },
    '/api/sesiones/materia/{materia}': {
      get: {
        tags: ['Sesiones'],
        summary: 'Listar sesiones por materia',
        parameters: [{ name: 'materia', in: 'path', required: true, schema: { type: 'string' }, description: 'ID, nombre o codigo de materia' }],
        responses: { 200: { description: 'Sesiones filtradas por materia' } }
      }
    },
    '/api/sesiones/fecha/{fecha}': {
      get: {
        tags: ['Sesiones'],
        summary: 'Listar sesiones por fecha',
        parameters: [{ name: 'fecha', in: 'path', required: true, schema: { type: 'string' }, example: '2026-05-28' }],
        responses: { 200: { description: 'Sesiones filtradas por fecha' } }
      }
    },
    '/api/sesiones/{id}': {
      get: {
        tags: ['Sesiones'],
        summary: 'Obtener sesion por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Sesion encontrada' } }
      },
      put: {
        tags: ['Sesiones'],
        summary: 'Actualizar sesion',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { example: { modalidad: 'presencial' } } } },
        responses: { 200: { description: 'Sesion actualizada' } }
      },
      delete: {
        tags: ['Sesiones'],
        summary: 'Eliminar sesion',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Sesion eliminada' } }
      }
    },
    '/api/recursos': {
      get: {
        tags: ['Recursos'],
        summary: 'Listar recursos',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Buscar por titulo' },
          { name: 'tipo', in: 'query', schema: { type: 'string' }, description: 'Filtrar por tipo' },
          { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', example: 10 } }
        ],
        responses: { 200: { description: 'Lista de recursos' } }
      },
      post: {
        tags: ['Recursos'],
        summary: 'Crear recurso y publicar recurso.publicado',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: {
                titulo: 'Guia Prisma',
                tipo: 'PDF',
                url: 'https://example.com/guia.pdf',
                descripcion: 'Material de apoyo',
                usuarioId: 1,
                materiaId: 1
              }
            }
          }
        },
        responses: { 201: { description: 'Recurso creado' } }
      }
    },
    '/api/recursos/tipo/{tipo}': {
      get: {
        tags: ['Recursos'],
        summary: 'Listar recursos por tipo',
        parameters: [{ name: 'tipo', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Recursos filtrados por tipo' } }
      }
    },
    '/api/recursos/buscar/{titulo}': {
      get: {
        tags: ['Recursos'],
        summary: 'Buscar recursos por titulo',
        parameters: [{ name: 'titulo', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Recursos encontrados' } }
      }
    },
    '/api/recursos/{id}': {
      get: {
        tags: ['Recursos'],
        summary: 'Obtener recurso por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Recurso encontrado' } }
      },
      put: {
        tags: ['Recursos'],
        summary: 'Actualizar recurso',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { example: { tipo: 'Video' } } } },
        responses: { 200: { description: 'Recurso actualizado' } }
      },
      delete: {
        tags: ['Recursos'],
        summary: 'Eliminar recurso',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Recurso eliminado' } }
      }
    }
  }
};

module.exports = swaggerSpec;
