const prisma = require('../config/db');
const { borrarTodaCache, crearCacheKey, guardarCache, obtenerCache } = require('../services/cacheService');
const { CHANNELS, publicarEvento } = require('../services/redisPublisher');
const { limpiarDatos, obtenerId, obtenerPaginacion, validarCampos } = require('../utils/request');

const includeRelaciones = {
  sesiones: true,
  recursos: true,
  grupos: true
};

const obtenerMaterias = async (req, res, next) => {
  try {
    const cacheKey = crearCacheKey('materias', req.query);
    const cache = await obtenerCache(cacheKey);

    if (cache) {
      res.set('X-Cache', 'HIT');
      return res.json(cache);
    }

    const { q, semestre } = req.query;
    const { skip, take } = obtenerPaginacion(req.query);
    const where = limpiarDatos({
      nombre: q ? { contains: q, mode: 'insensitive' } : undefined,
      semestre: semestre || undefined
    });

    const materias = await prisma.materia.findMany({
      where,
      include: includeRelaciones,
      skip,
      take,
      orderBy: { id: 'asc' }
    });

    await guardarCache(cacheKey, materias);
    res.set('X-Cache', 'MISS');
    res.json(materias);
  } catch (error) {
    next(error);
  }
};

const obtenerMateriasPorSemestre = async (req, res, next) => {
  try {
    const materias = await prisma.materia.findMany({
      where: { semestre: req.params.semestre },
      include: includeRelaciones,
      orderBy: { id: 'asc' }
    });

    res.json(materias);
  } catch (error) {
    next(error);
  }
};

const obtenerSesionesDeMateria = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const materia = await prisma.materia.findUnique({
      where: { id },
      include: {
        sesiones: {
          include: {
            usuario: true
          }
        }
      }
    });

    if (!materia) {
      return res.status(404).json({ error: `No existe una materia con id ${id}` });
    }

    res.json(materia.sesiones);
  } catch (error) {
    next(error);
  }
};

const obtenerMateriaPorId = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const materia = await prisma.materia.findUnique({
      where: { id },
      include: includeRelaciones
    });

    if (!materia) {
      return res.status(404).json({ error: `No existe una materia con id ${id}` });
    }

    res.json(materia);
  } catch (error) {
    next(error);
  }
};

const crearMateria = async (req, res, next) => {
  try {
    const campoFaltante = validarCampos(req.body, ['nombre', 'codigo']);

    if (campoFaltante) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${campoFaltante}` });
    }

    const materia = await prisma.materia.create({
      data: {
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        docente: req.body.docente,
        semestre: req.body.semestre
      }
    });

    await borrarTodaCache();
    await publicarEvento(CHANNELS.MATERIA_CREADA, 'materia.creada', materia);

    res.status(201).json(materia);
  } catch (error) {
    next(error);
  }
};

const actualizarMateria = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const materiaExiste = await prisma.materia.findUnique({ where: { id } });

    if (!materiaExiste) {
      return res.status(404).json({ error: `No existe una materia con id ${id}` });
    }

    const materia = await prisma.materia.update({
      where: { id },
      data: limpiarDatos({
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        docente: req.body.docente,
        semestre: req.body.semestre
      })
    });

    await borrarTodaCache();
    res.json(materia);
  } catch (error) {
    next(error);
  }
};

const eliminarMateria = async (req, res, next) => {
  try {
    const id = obtenerId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const materiaExiste = await prisma.materia.findUnique({ where: { id } });

    if (!materiaExiste) {
      return res.status(404).json({ error: `No existe una materia con id ${id}` });
    }

    await prisma.materia.delete({ where: { id } });

    await borrarTodaCache();
    res.json({ mensaje: `Materia con id ${id} eliminada correctamente` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  actualizarMateria,
  crearMateria,
  eliminarMateria,
  obtenerMateriaPorId,
  obtenerMaterias,
  obtenerMateriasPorSemestre,
  obtenerSesionesDeMateria
};
