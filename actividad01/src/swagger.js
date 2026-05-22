const swaggerJsdoc = require('swagger-jsdoc');

const jsonContent = schema => ({
    content: {
        'application/json': { schema }
    }
});

const errorResponse = description => ({
    description,
    ...jsonContent({ $ref: '#/components/schemas/Error' })
});

const listResponse = (description, schema) => ({
    description,
    ...jsonContent({
        type: 'array',
        items: { $ref: `#/components/schemas/${schema}` }
    })
});

const itemResponse = (description, schema) => ({
    description,
    ...jsonContent({ $ref: `#/components/schemas/${schema}` })
});

const idParameter = entity => ({
    name: 'id',
    in: 'path',
    required: true,
    description: `ID de ${entity}`,
    schema: { type: 'integer', example: 1 }
});

const textParameter = (name, description, example) => ({
    name,
    in: 'path',
    required: true,
    description,
    schema: { type: 'string', example }
});

const createRequest = schema => ({
    required: true,
    ...jsonContent({ $ref: `#/components/schemas/${schema}` })
});

module.exports = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'StudySync API',
            version: '1.0.0',
            description: 'API REST para coordinar usuarios, materias, grupos, sesiones y recursos de estudio.'
        },
        tags: [
            { name: 'Usuarios' },
            { name: 'Materias' },
            { name: 'Grupos' },
            { name: 'Sesiones' },
            { name: 'Recursos' }
        ],
        components: {
            parameters: {
                Search: {
                    name: 'q',
                    in: 'query',
                    description: 'Texto para buscar por nombre o titulo.',
                    schema: { type: 'string' }
                },
                Page: {
                    name: 'page',
                    in: 'query',
                    description: 'Numero de pagina.',
                    schema: { type: 'integer', default: 1 }
                },
                Limit: {
                    name: 'limit',
                    in: 'query',
                    description: 'Cantidad de registros por pagina.',
                    schema: { type: 'integer', default: 10 }
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Registro no encontrado' }
                    }
                },
                Message: {
                    type: 'object',
                    properties: {
                        mensaje: { type: 'string', example: 'Registro eliminado correctamente' }
                    }
                },
                UsuarioInput: {
                    type: 'object',
                    required: ['nombre', 'email', 'rol'],
                    properties: {
                        nombre: { type: 'string', example: 'Ana' },
                        email: { type: 'string', format: 'email', example: 'ana@gmail.com' },
                        rol: { type: 'string', example: 'estudiante' }
                    }
                },
                Usuario: {
                    allOf: [
                        { $ref: '#/components/schemas/UsuarioInput' },
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', example: 1 }
                            }
                        }
                    ]
                },
                MateriaInput: {
                    type: 'object',
                    required: ['nombre', 'codigo', 'semestre'],
                    properties: {
                        nombre: { type: 'string', example: 'Programacion' },
                        codigo: { type: 'string', example: 'PROG4' },
                        semestre: { type: 'string', example: '4' }
                    }
                },
                Materia: {
                    allOf: [
                        { $ref: '#/components/schemas/MateriaInput' },
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', example: 1 }
                            }
                        }
                    ]
                },
                GrupoInput: {
                    type: 'object',
                    required: ['nombre', 'materia', 'integrantes'],
                    properties: {
                        nombre: { type: 'string', example: 'Grupo Programacion' },
                        materia: { type: 'string', example: 'Programacion' },
                        integrantes: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['Ana', 'Luis']
                        }
                    }
                },
                Grupo: {
                    allOf: [
                        { $ref: '#/components/schemas/GrupoInput' },
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', example: 1 }
                            }
                        }
                    ]
                },
                IntegranteInput: {
                    type: 'object',
                    required: ['integrante'],
                    properties: {
                        integrante: { type: 'string', example: 'Carlos' }
                    }
                },
                SesionInput: {
                    type: 'object',
                    required: ['titulo', 'materia', 'fecha'],
                    properties: {
                        titulo: { type: 'string', example: 'Repaso de API REST' },
                        materia: { type: 'string', example: 'Programacion' },
                        fecha: { type: 'string', example: '2026-05-22' }
                    }
                },
                Sesion: {
                    allOf: [
                        { $ref: '#/components/schemas/SesionInput' },
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', example: 1 }
                            }
                        }
                    ]
                },
                RecursoInput: {
                    type: 'object',
                    required: ['titulo', 'tipo', 'url'],
                    properties: {
                        titulo: { type: 'string', example: 'Guia de Express' },
                        tipo: { type: 'string', example: 'pdf' },
                        url: { type: 'string', format: 'uri', example: 'https://example.com/guia' }
                    }
                },
                Recurso: {
                    allOf: [
                        { $ref: '#/components/schemas/RecursoInput' },
                        {
                            type: 'object',
                            properties: {
                                id: { type: 'integer', example: 1 }
                            }
                        }
                    ]
                }
            }
        },
        paths: {
            '/api/usuarios': {
                get: {
                    tags: ['Usuarios'],
                    summary: 'Listar usuarios',
                    parameters: [
                        { $ref: '#/components/parameters/Search' },
                        { $ref: '#/components/parameters/Page' },
                        { $ref: '#/components/parameters/Limit' },
                        {
                            name: 'rol',
                            in: 'query',
                            schema: { type: 'string', example: 'estudiante' }
                        }
                    ],
                    responses: { 200: listResponse('Usuarios encontrados.', 'Usuario') }
                },
                post: {
                    tags: ['Usuarios'],
                    summary: 'Crear usuario',
                    requestBody: createRequest('UsuarioInput'),
                    responses: {
                        201: itemResponse('Usuario creado.', 'Usuario'),
                        400: errorResponse('Faltan campos obligatorios.')
                    }
                }
            },
            '/api/usuarios/{id}': {
                get: {
                    tags: ['Usuarios'],
                    summary: 'Obtener usuario por ID',
                    parameters: [idParameter('usuario')],
                    responses: {
                        200: itemResponse('Usuario encontrado.', 'Usuario'),
                        404: errorResponse('Usuario no encontrado.')
                    }
                },
                put: {
                    tags: ['Usuarios'],
                    summary: 'Actualizar usuario',
                    parameters: [idParameter('usuario')],
                    requestBody: createRequest('UsuarioInput'),
                    responses: {
                        200: itemResponse('Usuario actualizado.', 'Usuario'),
                        404: errorResponse('Usuario no encontrado.')
                    }
                },
                delete: {
                    tags: ['Usuarios'],
                    summary: 'Eliminar usuario',
                    parameters: [idParameter('usuario')],
                    responses: {
                        200: itemResponse('Usuario eliminado.', 'Message'),
                        404: errorResponse('Usuario no encontrado.')
                    }
                }
            },
            '/api/usuarios/rol/{rol}': {
                get: {
                    tags: ['Usuarios'],
                    summary: 'Listar usuarios por rol',
                    parameters: [textParameter('rol', 'Rol del usuario.', 'estudiante')],
                    responses: { 200: listResponse('Usuarios encontrados.', 'Usuario') }
                }
            },
            '/api/usuarios/{id}/grupos': {
                get: {
                    tags: ['Usuarios'],
                    summary: 'Listar grupos de un usuario',
                    parameters: [idParameter('usuario')],
                    responses: {
                        200: listResponse('Grupos encontrados.', 'Grupo'),
                        404: errorResponse('Usuario no encontrado.')
                    }
                }
            },
            '/api/materias': {
                get: {
                    tags: ['Materias'],
                    summary: 'Listar materias',
                    parameters: [
                        { $ref: '#/components/parameters/Search' },
                        { $ref: '#/components/parameters/Page' },
                        { $ref: '#/components/parameters/Limit' },
                        {
                            name: 'semestre',
                            in: 'query',
                            schema: { type: 'string', example: '4' }
                        }
                    ],
                    responses: { 200: listResponse('Materias encontradas.', 'Materia') }
                },
                post: {
                    tags: ['Materias'],
                    summary: 'Crear materia',
                    requestBody: createRequest('MateriaInput'),
                    responses: {
                        201: itemResponse('Materia creada.', 'Materia'),
                        400: errorResponse('Faltan campos obligatorios.')
                    }
                }
            },
            '/api/materias/{id}': {
                get: {
                    tags: ['Materias'],
                    summary: 'Obtener materia por ID',
                    parameters: [idParameter('materia')],
                    responses: {
                        200: itemResponse('Materia encontrada.', 'Materia'),
                        404: errorResponse('Materia no encontrada.')
                    }
                },
                put: {
                    tags: ['Materias'],
                    summary: 'Actualizar materia',
                    parameters: [idParameter('materia')],
                    requestBody: createRequest('MateriaInput'),
                    responses: {
                        200: itemResponse('Materia actualizada.', 'Materia'),
                        404: errorResponse('Materia no encontrada.')
                    }
                },
                delete: {
                    tags: ['Materias'],
                    summary: 'Eliminar materia',
                    parameters: [idParameter('materia')],
                    responses: {
                        200: itemResponse('Materia eliminada.', 'Message'),
                        404: errorResponse('Materia no encontrada.')
                    }
                }
            },
            '/api/materias/semestre/{semestre}': {
                get: {
                    tags: ['Materias'],
                    summary: 'Listar materias por semestre',
                    parameters: [textParameter('semestre', 'Semestre de la materia.', '4')],
                    responses: { 200: listResponse('Materias encontradas.', 'Materia') }
                }
            },
            '/api/materias/{id}/sesiones': {
                get: {
                    tags: ['Materias'],
                    summary: 'Listar sesiones de una materia',
                    parameters: [idParameter('materia')],
                    responses: {
                        200: listResponse('Sesiones encontradas.', 'Sesion'),
                        404: errorResponse('Materia no encontrada.')
                    }
                }
            },
            '/api/grupos': {
                get: {
                    tags: ['Grupos'],
                    summary: 'Listar grupos',
                    parameters: [
                        { $ref: '#/components/parameters/Search' },
                        { $ref: '#/components/parameters/Page' },
                        { $ref: '#/components/parameters/Limit' },
                        {
                            name: 'materia',
                            in: 'query',
                            schema: { type: 'string', example: 'Programacion' }
                        }
                    ],
                    responses: { 200: listResponse('Grupos encontrados.', 'Grupo') }
                },
                post: {
                    tags: ['Grupos'],
                    summary: 'Crear grupo',
                    requestBody: createRequest('GrupoInput'),
                    responses: {
                        201: itemResponse('Grupo creado.', 'Grupo'),
                        400: errorResponse('Faltan campos obligatorios.')
                    }
                }
            },
            '/api/grupos/{id}': {
                get: {
                    tags: ['Grupos'],
                    summary: 'Obtener grupo por ID',
                    parameters: [idParameter('grupo')],
                    responses: {
                        200: itemResponse('Grupo encontrado.', 'Grupo'),
                        404: errorResponse('Grupo no encontrado.')
                    }
                },
                put: {
                    tags: ['Grupos'],
                    summary: 'Actualizar grupo',
                    parameters: [idParameter('grupo')],
                    requestBody: createRequest('GrupoInput'),
                    responses: {
                        200: itemResponse('Grupo actualizado.', 'Grupo'),
                        404: errorResponse('Grupo no encontrado.')
                    }
                },
                delete: {
                    tags: ['Grupos'],
                    summary: 'Eliminar grupo',
                    parameters: [idParameter('grupo')],
                    responses: {
                        200: itemResponse('Grupo eliminado.', 'Message'),
                        404: errorResponse('Grupo no encontrado.')
                    }
                }
            },
            '/api/grupos/materia/{materia}': {
                get: {
                    tags: ['Grupos'],
                    summary: 'Listar grupos por materia',
                    parameters: [textParameter('materia', 'Materia del grupo.', 'Programacion')],
                    responses: { 200: listResponse('Grupos encontrados.', 'Grupo') }
                }
            },
            '/api/grupos/{id}/integrantes': {
                post: {
                    tags: ['Grupos'],
                    summary: 'Agregar integrante a un grupo',
                    parameters: [idParameter('grupo')],
                    requestBody: createRequest('IntegranteInput'),
                    responses: {
                        201: itemResponse('Integrante agregado.', 'Grupo'),
                        400: errorResponse('Falta el integrante.'),
                        404: errorResponse('Grupo no encontrado.')
                    }
                }
            },
            '/api/sesiones': {
                get: {
                    tags: ['Sesiones'],
                    summary: 'Listar sesiones',
                    parameters: [
                        { $ref: '#/components/parameters/Search' },
                        { $ref: '#/components/parameters/Page' },
                        { $ref: '#/components/parameters/Limit' },
                        {
                            name: 'materia',
                            in: 'query',
                            schema: { type: 'string', example: 'Programacion' }
                        }
                    ],
                    responses: { 200: listResponse('Sesiones encontradas.', 'Sesion') }
                },
                post: {
                    tags: ['Sesiones'],
                    summary: 'Crear sesion',
                    requestBody: createRequest('SesionInput'),
                    responses: {
                        201: itemResponse('Sesion creada.', 'Sesion'),
                        400: errorResponse('Faltan campos obligatorios.')
                    }
                }
            },
            '/api/sesiones/{id}': {
                get: {
                    tags: ['Sesiones'],
                    summary: 'Obtener sesion por ID',
                    parameters: [idParameter('sesion')],
                    responses: {
                        200: itemResponse('Sesion encontrada.', 'Sesion'),
                        404: errorResponse('Sesion no encontrada.')
                    }
                },
                put: {
                    tags: ['Sesiones'],
                    summary: 'Actualizar sesion',
                    parameters: [idParameter('sesion')],
                    requestBody: createRequest('SesionInput'),
                    responses: {
                        200: itemResponse('Sesion actualizada.', 'Sesion'),
                        404: errorResponse('Sesion no encontrada.')
                    }
                },
                delete: {
                    tags: ['Sesiones'],
                    summary: 'Eliminar sesion',
                    parameters: [idParameter('sesion')],
                    responses: {
                        200: itemResponse('Sesion eliminada.', 'Message'),
                        404: errorResponse('Sesion no encontrada.')
                    }
                }
            },
            '/api/sesiones/materia/{materia}': {
                get: {
                    tags: ['Sesiones'],
                    summary: 'Listar sesiones por materia',
                    parameters: [textParameter('materia', 'Materia de la sesion.', 'Programacion')],
                    responses: { 200: listResponse('Sesiones encontradas.', 'Sesion') }
                }
            },
            '/api/sesiones/fecha/{fecha}': {
                get: {
                    tags: ['Sesiones'],
                    summary: 'Listar sesiones por fecha',
                    parameters: [textParameter('fecha', 'Fecha de la sesion.', '2026-05-22')],
                    responses: { 200: listResponse('Sesiones encontradas.', 'Sesion') }
                }
            },
            '/api/recursos': {
                get: {
                    tags: ['Recursos'],
                    summary: 'Listar recursos',
                    parameters: [
                        { $ref: '#/components/parameters/Search' },
                        { $ref: '#/components/parameters/Page' },
                        { $ref: '#/components/parameters/Limit' },
                        {
                            name: 'tipo',
                            in: 'query',
                            schema: { type: 'string', example: 'pdf' }
                        }
                    ],
                    responses: { 200: listResponse('Recursos encontrados.', 'Recurso') }
                },
                post: {
                    tags: ['Recursos'],
                    summary: 'Crear recurso',
                    requestBody: createRequest('RecursoInput'),
                    responses: {
                        201: itemResponse('Recurso creado.', 'Recurso'),
                        400: errorResponse('Faltan campos obligatorios.')
                    }
                }
            },
            '/api/recursos/{id}': {
                get: {
                    tags: ['Recursos'],
                    summary: 'Obtener recurso por ID',
                    parameters: [idParameter('recurso')],
                    responses: {
                        200: itemResponse('Recurso encontrado.', 'Recurso'),
                        404: errorResponse('Recurso no encontrado.')
                    }
                },
                put: {
                    tags: ['Recursos'],
                    summary: 'Actualizar recurso',
                    parameters: [idParameter('recurso')],
                    requestBody: createRequest('RecursoInput'),
                    responses: {
                        200: itemResponse('Recurso actualizado.', 'Recurso'),
                        404: errorResponse('Recurso no encontrado.')
                    }
                },
                delete: {
                    tags: ['Recursos'],
                    summary: 'Eliminar recurso',
                    parameters: [idParameter('recurso')],
                    responses: {
                        200: itemResponse('Recurso eliminado.', 'Message'),
                        404: errorResponse('Recurso no encontrado.')
                    }
                }
            },
            '/api/recursos/tipo/{tipo}': {
                get: {
                    tags: ['Recursos'],
                    summary: 'Listar recursos por tipo',
                    parameters: [textParameter('tipo', 'Tipo de recurso.', 'pdf')],
                    responses: { 200: listResponse('Recursos encontrados.', 'Recurso') }
                }
            },
            '/api/recursos/buscar/{titulo}': {
                get: {
                    tags: ['Recursos'],
                    summary: 'Buscar recursos por titulo',
                    parameters: [textParameter('titulo', 'Texto incluido en el titulo.', 'express')],
                    responses: { 200: listResponse('Recursos encontrados.', 'Recurso') }
                }
            }
        }
    },
    apis: []
});
