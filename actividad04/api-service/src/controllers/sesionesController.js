const prisma = require('../config/db');
const { borrarTodaCache, crearCacheKey, guardarCache, obtenerCache } = require('../services/cacheService');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');
const { limpiarDatos, obtenerId, obtenerPaginacion, validarCampos } = require('../utils/request');

const includeRelaciones = {
  usuario: true,
  materia: true
};

const obtenerSesiones = async (req, res, next) => {
  try {
    const cacheKey = crearCacheKey('sesiones', req.query);
    const cache = await obtenerCache(cacheKey);

    if (cache) {
      res.set('X-Cache', 'HIT');
      return res.json(cache);
    }

    const { q, materia, fecha, fechaDesde, fechaHasta } = req.query;
    const { skip, take } = obtenerPaginacion(req.query);

    let filtroFecha = undefined;
    if (fecha) {
      filtroFecha = fecha;
    } else if (fechaDesde || fechaHasta) {
      filtroFecha = limpiarDatos({ gte: fechaDesde, lte: fechaHasta });
    }

    const where = limpiarDatos({
      titulo: q ? { contains: q, mode: 'insensitive' } : undefined,
      fecha: filtroFecha,
      materia: materia
        ? {
            OR: [
              { nombre: { contains: materia, mode: 'insensitive' } },
              { codigo: { contains: materia, mode: 'insensitive' } },
              Number.isInteger(Number(materia)) ? { id: Number(materia) } : undefined
            ].filter(Boolean)
          }
        : undefined
    });

    const sesiones = await prisma.sesion.findMany({
      where,
      include: includeRelaciones,
      skip,
      take,
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }]
    });

    const total = await prisma.sesion.count({ where });

    await guardarCache(cacheKey, sesiones);
    res.set('X-Cache', 'MISS');
    res.set('X-Total-Count', String(total));
    res.json(sesiones);
  } catch (error) {
    next(error);
  }
};

const obtenerSesionesPorMateria = async (req, res, next) => {
  try {
    const materia = req.params.materia;

    const sesiones = await prisma.sesion.findMany({
      where: {
        materia: {
          OR: [
            { nombre: { contains: materia, mode: 'insensitive' } },
            { codigo: { contains: materia, mode: 'insensitive' } },
            Number.isInteger(Number(materia)) ? { id: Number(materia) } : undefined
          ].filter(Boolean)
        }
      },
      include: includeRelaciones,
      orderBy: { id: 'asc' }
    });

    res.json(sesiones);
  } catch (error) {
    next(error);
  }
};

const obtenerSesionesPorFecha = async (req, res, next) => {
  try {
    const sesiones = await prisma.sesion.findMany({
      where: { fecha: req.params.fecha },
      include: includeRelaciones,
      orderBy: { id: 'asc' }
    });

    res.json(sesiones);
  } catch (error) {
    next(error);
  }
};

const obtenerSesionPorId = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const sesion = await prisma.sesion.findUnique({
      where: { id },
      include: includeRelaciones
    });

    if (!sesion) {
      return res.status(404).json({ error: `No existe una sesion con id ${id}` });
    }

    res.json(sesion);
  } catch (error) {
    next(error);
  }
};

const crearSesion = async (req, res, next) => {
  try {
    const campoFaltante = validarCampos(req.body, [
      'titulo',
      'fecha',
      'hora',
      'modalidad',
      'materiaId'
    ]);
 
    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }
 
    const sesion = await prisma.sesion.create({
      data: {
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        fecha: req.body.fecha,
        hora: req.body.hora,
        modalidad: req.body.modalidad,
        usuarioId: req.user.id,
        materiaId: Number(req.body.materiaId)
      },
      include: includeRelaciones
    });
 
    await borrarTodaCache();
    await publicarEvento(CHANNELS.SESION_CREADA, 'sesion.creada', sesion);
 
    res.status(201).json(sesion);
  } catch (error) {
    next(error);
  }
};


const actualizarSesion = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const sesionExiste = await prisma.sesion.findUnique({ where: { id } });

    if (!sesionExiste) {
      return res.status(404).json({ error: `No existe una sesion con id ${id}` });
    }

    const sesion = await prisma.sesion.update({
      where: { id },
      data: limpiarDatos({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        fecha: req.body.fecha,
        hora: req.body.hora,
        modalidad: req.body.modalidad,
        usuarioId: req.body.usuarioId !== undefined ? Number(req.body.usuarioId) : undefined,
        materiaId: req.body.materiaId !== undefined ? Number(req.body.materiaId) : undefined
      }),
      include: includeRelaciones
    });

    await borrarTodaCache();
    res.json(sesion);
  } catch (error) {
    next(error);
  }
};

const eliminarSesion = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const sesionExiste = await prisma.sesion.findUnique({ where: { id } });

    if (!sesionExiste) {
      return res.status(404).json({ error: `No existe una sesion con id ${id}` });
    }

    await prisma.sesion.delete({ where: { id } });

    await borrarTodaCache();
    res.json({ mensaje: `Sesion con id ${id} eliminada correctamente` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  actualizarSesion,
  crearSesion,
  eliminarSesion,
  obtenerSesionPorId,
  obtenerSesiones,
  obtenerSesionesPorFecha,
  obtenerSesionesPorMateria
};
