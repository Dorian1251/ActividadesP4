const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

jest.mock('../src/config/db', () => ({
  usuario: {
    create: jest.fn()
  },
  materia: {
    create: jest.fn()
  },
  grupo: {
    create: jest.fn()
  },
  sesion: {
    create: jest.fn()
  },
  recurso: {
    create: jest.fn()
  }
}));

jest.mock('../src/services/redisPublisher', () => ({
  CHANNELS: {
    MATERIA_CREADA: 'study:materia:creada',
    RECURSO_PUBLICADO: 'study:recurso:publicado',
    SESION_CREADA: 'study:sesion:creada',
    USUARIO_REGISTRADO: 'study:usuario:registrado',
    USUARIO_UNIDO: 'study:usuario:unido'
  },
  publicarEvento: jest.fn()
}));

describe('StudySync API Actividad 03', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET / responde informacion de la API', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toContain('StudySync API Actividad 03');
    expect(res.body.entidades).toContain('sesiones');
  });

  test('POST /api/usuarios sin nombre responde 400', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        email: 'ana@test.com',
        rol: 'estudiante'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('nombre');
    expect(prisma.usuario.create).not.toHaveBeenCalled();
  });

  test('POST /api/materias sin codigo responde 400', async () => {
    const res = await request(app)
      .post('/api/materias')
      .send({
        nombre: 'Programacion IV',
        semestre: '4'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('codigo');
    expect(prisma.materia.create).not.toHaveBeenCalled();
  });

  test('POST /api/grupos sin materiaId responde 400', async () => {
    const res = await request(app)
      .post('/api/grupos')
      .send({
        nombre: 'Grupo Redis',
        descripcion: 'Grupo de estudio',
        organizadorId: 1
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('materiaId');
    expect(prisma.grupo.create).not.toHaveBeenCalled();
  });

  test('POST /api/sesiones sin usuarioId responde 400', async () => {
    const res = await request(app)
      .post('/api/sesiones')
      .send({
        titulo: 'Sesion de prueba',
        fecha: '2026-05-28',
        hora: '18:00',
        modalidad: 'virtual',
        materiaId: 1
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('usuarioId');
    expect(prisma.sesion.create).not.toHaveBeenCalled();
  });

  test('POST /api/recursos sin url responde 400', async () => {
    const res = await request(app)
      .post('/api/recursos')
      .send({
        titulo: 'Guia Prisma',
        tipo: 'PDF',
        usuarioId: 1,
        materiaId: 1
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('url');
    expect(prisma.recurso.create).not.toHaveBeenCalled();
  });
});
