const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'StudySync API Actividad 03',
    version: '1.0.0',
    description: 'API REST con Express, Prisma, Supabase PostgreSQL, Redis Pub/Sub, Socket.io y Swagger.'
  },
  servers: [
    {
      url: '/',
      description: 'Servidor actual'
    }
  ],
  tags: [
    { name: 'Usuarios' },
    { name: 'Materias' },
    { name: 'Grupos' },
    { name: 'Sesiones' },
    { name: 'Recursos' }
  ],
  paths: {
    '/api/usuarios': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar usuarios',
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
        responses: { 200: { description: 'Lista de materias' } }
      },
      post: {
        tags: ['Materias'],
        summary: 'Crear materia',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              example: { nombre: 'Programacion IV', codigo: 'PROG4', docente: 'Ing. Ramirez' }
            }
          }
        },
        responses: { 201: { description: 'Materia creada' } }
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
