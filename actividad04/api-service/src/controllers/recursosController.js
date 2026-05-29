const prisma = require('../config/db');
const { borrarTodaCache, crearCacheKey, guardarCache, obtenerCache } = require('../services/cacheService');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');
const { limpiarDatos, obtenerId, obtenerPaginacion, validarCampos } = require('../utils/request');

const includeRelaciones = {
  usuario: true,
  materia: true
};

const obtenerRecursos = async (req, res, next) => {
  try {
    const cacheKey = crearCacheKey('recursos', req.query);
    const cache = await obtenerCache(cacheKey);

    if (cache) {
      res.set('X-Cache', 'HIT');
      return res.json(cache);
    }

    const { q, tipo } = req.query;
    const { skip, take } = obtenerPaginacion(req.query);
    const where = limpiarDatos({
      titulo: q ? { contains: q, mode: 'insensitive' } : undefined,
      tipo: tipo || undefined
    });

    const recursos = await prisma.recurso.findMany({
      where,
      include: includeRelaciones,
      skip,
      take,
      orderBy: { id: 'asc' }
    });

    await guardarCache(cacheKey, recursos);
    res.set('X-Cache', 'MISS');
    res.json(recursos);
  } catch (error) {
    next(error);
  }
};

const obtenerRecursosPorTipo = async (req, res, next) => {
  try {
    const recursos = await prisma.recurso.findMany({
      where: { tipo: req.params.tipo },
      include: includeRelaciones,
      orderBy: { id: 'asc' }
    });

    res.json(recursos);
  } catch (error) {
    next(error);
  }
};

const buscarRecursosPorTitulo = async (req, res, next) => {
  try {
    const recursos = await prisma.recurso.findMany({
      where: {
        titulo: {
          contains: req.params.titulo,
          mode: 'insensitive'
        }
      },
      include: includeRelaciones,
      orderBy: { id: 'asc' }
    });

    res.json(recursos);
  } catch (error) {
    next(error);
  }
};

const obtenerRecursoPorId = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const recurso = await prisma.recurso.findUnique({
      where: { id },
      include: includeRelaciones
    });

    if (!recurso) {
      return res.status(404).json({ error: `No existe un recurso con id ${id}` });
    }

    res.json(recurso);
  } catch (error) {
    next(error);
  }
};

const crearRecurso = async (req, res, next) => {
  try {
    const campoFaltante = validarCampos(req.body, ['titulo', 'tipo', 'url', 'usuarioId', 'materiaId']);

    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }

    const recurso = await prisma.recurso.create({
      data: {
        titulo: req.body.titulo,
        tipo: req.body.tipo,
        url: req.body.url,
        descripcion: req.body.descripcion,
        usuarioId: Number(req.body.usuarioId),
        materiaId: Number(req.body.materiaId)
      },
      include: includeRelaciones
    });

    await borrarTodaCache();
    await publicarEvento(CHANNELS.RECURSO_PUBLICADO, 'recurso.publicado', recurso);

    res.status(201).json(recurso);
  } catch (error) {
    next(error);
  }
};

const actualizarRecurso = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const recursoExiste = await prisma.recurso.findUnique({ where: { id } });

    if (!recursoExiste) {
      return res.status(404).json({ error: `No existe un recurso con id ${id}` });
    }

    const recurso = await prisma.recurso.update({
      where: { id },
      data: limpiarDatos({
        titulo: req.body.titulo,
        tipo: req.body.tipo,
        url: req.body.url,
        descripcion: req.body.descripcion,
        usuarioId: req.body.usuarioId !== undefined ? Number(req.body.usuarioId) : undefined,
        materiaId: req.body.materiaId !== undefined ? Number(req.body.materiaId) : undefined
      }),
      include: includeRelaciones
    });

    await borrarTodaCache();
    res.json(recurso);
  } catch (error) {
    next(error);
  }
};

const eliminarRecurso = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const recursoExiste = await prisma.recurso.findUnique({ where: { id } });

    if (!recursoExiste) {
      return res.status(404).json({ error: `No existe un recurso con id ${id}` });
    }

    await prisma.recurso.delete({ where: { id } });

    await borrarTodaCache();
    res.json({ mensaje: `Recurso con id ${id} eliminado correctamente` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  actualizarRecurso,
  buscarRecursosPorTitulo,
  crearRecurso,
  eliminarRecurso,
  obtenerRecursoPorId,
  obtenerRecursos,
  obtenerRecursosPorTipo
};
